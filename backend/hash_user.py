import bcrypt

password = "Ahmad03@@".encode()

hashed = bcrypt.hashpw(password, bcrypt.gensalt())

print(hashed.decode())