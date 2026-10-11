import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('49.233.141.84', username='ubuntu', password='!@xy1234')

commands = [
    'cd ~/zero-to-tech && git pull',
    'cd ~/zero-to-tech && npm install',
    'cd ~/zero-to-tech && npm run build',
    'sudo systemctl restart frontend',
]

for cmd in commands:
    print(f'执行: {cmd[:60]}...')
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    print(out[:800])

ssh.close()
print('代码同步完成')
