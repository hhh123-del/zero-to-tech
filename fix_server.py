import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('49.233.141.84', username='ubuntu', password='!@xy1234')

# 上传修改的文件
sftp = ssh.open_sftp()
sftp.put(r'E:\zero-to-tech\public\js\report.js', '/home/ubuntu/zero-to-tech/public/js/report.js')
sftp.put(r'E:\zero-to-tech\public\css\report.css', '/home/ubuntu/zero-to-tech/public/css/report.css')
sftp.close()

# 重新build前端
stdin, stdout, stderr = ssh.exec_command('cd ~/zero-to-tech && npm run build 2>&1 | tail -5')
stdout.channel.recv_exit_status()
print(stdout.read().decode())

ssh.close()
print('前端更新完成')
