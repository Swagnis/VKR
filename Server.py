from flask import Flask, request, render_template, redirect
from flask_restful import Resource, Api

from CollocationController import CollocationController
from MorphAnalysisController import MorphAnalysisController
from DialogAgentController import DialogAgentController

class Server():
    def __init__(self):
        self.app = Flask("Web Application", static_url_path = "") #static_url_path = "" включает index.html
        self.api = Api(self.app)
        self.controllers = []

        self.InitializeControllers()

    def InitializeControllers(self):
        # Add redirect to main page resource 
        self.api.add_resource(self.MainPage, '/')

        self.controllers.append(CollocationController(self.api))
        self.controllers.append(MorphAnalysisController(self.api)) 
        self.controllers.append(DialogAgentController(self.api))       
        self.Run(True)

    def Run(self, _debug=False):
        self.app.run(debug=_debug)

    class MainPage(Resource):
        def get(self):
            return redirect("http://localhost:5000/index.html", code=302)

 
if __name__ == '__main__':
    server = Server()
    #server.Run(True)