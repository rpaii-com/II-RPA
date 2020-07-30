import importlib
import json
import pathlib
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from inspect import signature

import pythoncom

port = 8000


class PluginHandler(BaseHTTPRequestHandler):
    module_cache = {}

    def do_POST(self): #post请求，
        params = json.loads(self.rfile.read(int(self.headers['Content-Length']))) #从headers读取数据转为json，
        self.log_message(str(params))
        resp =self.plugin_service(params)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        #resp = str(resp) #WebDriver转不了json，这里直接转为str类型，
        self.wfile.write(json.dumps(resp).encode("utf-8"))

    def do_GET(self): #get请求，
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def plugin_service(self,params): #处理传递的值，
        module_path = params["pythonfilePath"]
        func_name = params["functionName"]
        parameters = params["parameters"]
        timestamp = params["timestamp"]
        # pth = pathlib.PurePath(module_path)
        if not self.module_cache.get(module_path):
            module_spec = check_module(module_path)
            if module_spec:
                module = import_module_from_spec(module_spec)
                self.module_cache[module_path] = module
        module = self.module_cache[module_path]
        try:
            func = getattr(module, func_name)
            sig = signature(func)
            params_names = list(sig.parameters.keys())
            kw = {i: parameters[i] for i in params_names}
            content = func(**kw)
            respn = {
                "code": 200,
                "msg": "OK",
                "content": content,
                "timestamp": timestamp
            }
        except Exception as e:
            print(e)
            respn = {
                "code": 500,
                "msg": str(e),
                "content": None,
                "timestamp": timestamp
            }
        return respn

def check_module(module_path):
    """检查模块时候能被导入而不用实际的导入模块"""

    module_name = pathlib.PurePath(module_path).name #获取传入py的模块名称，

    module_spec = importlib.util.spec_from_file_location(module_name.split('.')[0], module_path) #引入模块，
    if module_spec is None:
        print('Module: {} not found'.format(module_name))
        return None
    else:
        print('Module: {} can be imported!'.format(module_name))
        return module_spec


def import_module_from_spec(module_spec):
    """通过传入模块的spec返回新的被导入的模块对象"""
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    return module


def run(server_class=HTTPServer, handler_class=None, port=8008):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    httpd.request_queue_size = 16
    print('Starting httpd on port %d...' % port)
    httpd.serve_forever()


if __name__ == '__main__':
    port = int(sys.argv[1])
    #print(sys)
    pythoncom.CoInitialize()
    run(handler_class=PluginHandler, port=port)