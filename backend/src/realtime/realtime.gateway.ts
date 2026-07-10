import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import {
  AlertRealtimeEvent,
  MachineStatusChangedEvent,
  REALTIME_EVENTS,
} from './types/realtime-event.types';

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'development-secret',
      });
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (
        !session ||
        session.userId !== payload.sub ||
        session.user.status !== 'ACTIVE' ||
        (session.expirationDate && session.expirationDate <= new Date())
      ) {
        throw new Error('Invalid realtime session');
      }

      client.data.userId = session.userId;
    } catch (error) {
      this.logger.warn(
        `Rejected realtime connection: ${error instanceof Error ? error.message : 'Invalid token'}`,
      );
      client.disconnect(true);
    }
  }

  emitMachineStatusChanged(event: MachineStatusChangedEvent) {
    this.server.emit(REALTIME_EVENTS.machineStatusChanged, event);
  }

  emitAlertCreated(event: AlertRealtimeEvent) {
    this.server.emit(REALTIME_EVENTS.alertCreated, event);
  }

  emitAlertResolved(event: AlertRealtimeEvent) {
    this.server.emit(REALTIME_EVENTS.alertResolved, event);
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length);
    }

    throw new Error('Missing realtime token');
  }
}
