from flask_restful import Resource, Api

# При инициализации создаёт ссылки на все ресурсы этого контроллера
class HelpController():
    def __init__(self, api):
        api.add_resource(self.Help, '/api/')

    class Help(Resource):
        def get(self):
            return {"api": ["Hello, World!"]}