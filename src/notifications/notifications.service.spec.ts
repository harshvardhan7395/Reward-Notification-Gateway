import { NotificationsService, SocketClient } from './notifications.service';

const makeSocket = (id: string): SocketClient & { emit: jest.Mock } => ({
  id,
  emit: jest.fn(),
});

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService();
  });

  it('should register a socket for a userId on connect', () => {
    const socket = makeSocket('s1');
    service.register('user-1', socket);
    expect(service.getSocket('user-1')).toBe(socket);
  });

  it('should remove the socket for a userId on disconnect', () => {
    const socket = makeSocket('s1');
    service.register('user-1', socket);
    service.deregister('user-1');
    expect(service.getSocket('user-1')).toBeUndefined();
  });

  it('should emit a reward event to the correct user socket', () => {
    const socketA = makeSocket('s1');
    const socketB = makeSocket('s2');
    service.register('user-A', socketA);
    service.register('user-B', socketB);

    service.sendReward('user-A', { amount: 50, description: 'Survey complete' });

    expect(socketA.emit).toHaveBeenCalledWith('reward', { amount: 50, description: 'Survey complete' });
    expect(socketB.emit).not.toHaveBeenCalled();
  });

  it('should not throw when sending to an unconnected user', () => {
    expect(() =>
      service.sendReward('ghost-user', { amount: 10, description: 'test' }),
    ).not.toThrow();
  });
});
