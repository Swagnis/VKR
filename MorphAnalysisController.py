from flask import Flask, request, render_template, redirect, jsonify
from flask_restful import Resource, Api
from Enums import Rules, Languages
from rutermextract import TermExtractor
import json
import pymorphy2
from pymystem3 import Mystem

# При инициализации создаёт ссылки на все ресурсы этого контроллера
class MorphAnalysisController():
    def __init__(self, api):
        api.add_resource(self.GetAnalysis, '/api/GetAnalysis')

    class GetAnalysis(Resource):        
        def get(self):
            return {"api": ["Hello, World!"]}

        def post(self):
            json_data = request.get_json(force=True)
            text = json_data['text']
            m = Mystem()
            result = m.analyze(text)

            return jsonify({ "analysis": result })
