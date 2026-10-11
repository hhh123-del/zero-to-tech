import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('49.233.141.84', username='ubuntu', password='!@xy1234')

# 上传CSV文件
sftp = ssh.open_sftp()
sftp.put(r'C:\ProgramData\MySQL\MySQL Server 8.0\Uploads\rfm_data.csv', '/home/ubuntu/zero-to-tech/backend/rfm_data.csv')
sftp.close()

print('CSV上传完成')

# 检查文件
stdin, stdout, stderr = ssh.exec_command('ls -lh ~/zero-to-tech/backend/rfm_data.csv')
print(stdout.read().decode())

ssh.close()
