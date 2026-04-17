import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '@tracelite/db';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async signup(signupDto: SignupDto): Promise<{ access_token: string }> {
        const email = signupDto.email;
        const doesEmailAlreadyExist = await this.prisma.user.findUnique({ where: { email } });
        if (doesEmailAlreadyExist) {
            throw new ConflictException('Email already exists');
        }
        const password = await bcrypt.hash(signupDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password
            }
        });
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return { access_token: token };
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const doesPasswordMatch = await bcrypt.compare(password, user.password);
        if (!doesPasswordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return { access_token: token };
    }
}
