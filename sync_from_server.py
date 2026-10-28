import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('49.233.141.84', username='ubuntu', password='!@Xy1234')

# 看看main.py里还有没有硬编码的密钥
stdin, stdout, stderr = ssh.exec_command('grep -n "sk-" ~/zero-to-tech/backend/main.py')
print("=== main.py里的密钥 ===")
print(stdout.read().decode() if stdout.read() else "没有硬编码密钥")

# 看看.env文件
stdin, stdout, stderr = ssh.exec_command('cat ~/zero-to-tech/backend/.env')
print("=== .env文件内容 ===")
print(stdout.read().decode())

# 看看最新的commit
stdin, stdout, stderr = ssh.exec_command('cd ~/zero-to-tech && git log --oneline -3')
print("=== 最新commit ===")
print(stdout.read().decode())

ssh.close()
