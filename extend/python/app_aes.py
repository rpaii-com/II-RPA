from Crypto.Cipher import AES
import base64


#加密数据长度限制，长度必须为16（AES-128）、24（AES-192）、或32（AES-256）
TEXTLENGTH = 16
IV = "0000000000000000"

#正文处理，
def data_length16(text):
    text = text.encode("utf-8")
    count = len(text)
    if (count % TEXTLENGTH != 0):
        add = TEXTLENGTH - (count % TEXTLENGTH)
    else:
        add = 0
    text = text + ("\0".encode("utf-8") * add)
    return text

#加密，
def encrypt(key, text):
    """
    AES_128_CBC
    16位，
    :param key:
    :param text:
    :return:
    """
    key = key_length16(key)
    # 模式，CBC，
    crypto = AES.new(key, AES.MODE_CBC, key)
    text = data_length16(text)
    print(len(text))
    encrypt_data = crypto.encrypt(text)
    encrypt_data = base64.b64encode(encrypt_data)
    encrypt_data = encrypt_data.decode("utf-8")
    return encrypt_data


#密码和向量限制16长度，
def key_length16(key):
    count_key = len(key.encode("utf-8"))
    if(key):
        key = key.encode("utf-8")
    if(count_key > TEXTLENGTH):
        key = key[0:TEXTLENGTH]
        return key
    elif(count_key < TEXTLENGTH):
        print(key)
        if(key):
            key += ('\0'.encode("utf-8") * (TEXTLENGTH - count_key))
            return key
        else:
            key = "0".encode("utf-8")
            key += ('\0'.encode("utf-8") * (TEXTLENGTH - count_key - 1))
            return key
    else:
        return key

#解密，
def decrypt(key, text):
    key = key_length16(key)
    crypto = AES.new(key, AES.MODE_CBC, key)
    text = text.encode("utf-8")
    text = base64.b64decode(text)
    print(text)
    decrypt_data = crypto.decrypt(text)
    decrypt_data = decrypt_data.decode("utf-8")
    return decrypt_data

def test(s):
    pad = lambda s: s + (16 - len(s) % 16) * chr(1)
    return pad(s)

if __name__ == '__main__':
    key = ""
    # #text = "c<>   ?()*&啊"
    text = "啊撒擦拭试点城市多少次都是成熟的城市到处都是21231231231"
    encrypt_data = encrypt(key, text)
    print(encrypt_data)
    decrypt_data = decrypt(key,encrypt_data)
    print(decrypt_data)
    # print(key_length16("aaaaaaaaaaaaaaaaaaaaaaaaa"))
    #print(AES.__file__)
    #s = "aahhhhhhhhhhhhhhhhhhhh"
    #print(data_length16(s))