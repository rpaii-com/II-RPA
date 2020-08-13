import os

def script_call(script_command, script_parameter = ""):
    if len(script_parameter)>0:
        script_command = script_command + " " + str(script_parameter).replace("，", " ")
    result = os.popen(script_command)
    res = result.read()
    return res.splitlines()
    # for line in res.splitlines():
    #    print(line)
    # result = os.popen(r"node/python C:\Users\shen\Desktop\test_js.js 321")
    # res = result.read()
    # for line in res.splitlines():
    #    print(line)

if __name__ == '__main__':
    print(script_call(r"python C:\Users\shen\Desktop\test_file.py"))
    # print(script_call(r"node C:\Users\shen\Desktop\test_js.js"))
    # a = script_call(r"node C:\Users\shen\Desktop\test_js.js")
    # print(a[0])
