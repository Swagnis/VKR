from flask import Flask, request, render_template, redirect, jsonify
from flask_restful import Resource, Api
from Enums import Rules, Languages
from rutermextract import TermExtractor
import json

# При инициализации создаёт ссылки на все ресурсы этого контроллера
class CollocationController():
    def __init__(self, api):
        api.add_resource(self.GetCollocations, '/api/GetCollocations')

    class GetCollocations(Resource):        
        def get(self):
            return {"api": ["Hello, World!"]}

        def post(self):
            json_data = request.get_json(force=True)
            text = json_data['text']
            rules = json_data['rules']
            number = json_data['number']
            language = json_data['language']
            collocations = []
            if (language == Languages.Russian.value):
                collocations = self.getRuCollocations(text, rules, number)
            elif (language == Languages.English.value):
                collocations = self.getRuCollocations(text, rules, number)

            return jsonify({ "collocations": collocations })

        def getRuCollocations(self, text, rules, number):
            collocations = []
            termExctractor = TermExtractor()
            for term in termExctractor(text):
                collocations.append(term)

            collocations = self.filterRuCollocations(collocations, rules, number)
            # filter collocations
            collocations = list(map(lambda x: x.normalized, collocations))

            return collocations

        def filterRuCollocations(self, collocations, rules, number, weightFilter = False):

            col = collocations

            if (Rules.NotShorter.value in rules):
                col = filter(lambda x: len(x.normalized) >= int(number), col)

            if (Rules.NotLonger.value in rules):
                col = filter(lambda x: len(x.normalized) <= int(number), col)

            if (Rules.NotLessWordsInCollocation.value in rules):
                col = filter(lambda x: x.word_count  >= int(number), col)

            if (Rules.NotMoreWordsInCollocation.value in rules):
                col = filter(lambda x: x.word_count <= int(number), col)

            if (Rules.NotLessWeight.value in rules and weightFilter is True):
                pass

            if (Rules.NotMoreWeight.value in rules and weightFilter is True):
                pass

            return col

class Collocation():
    def __init__(self, term, count):
        self.term = term
        self.count = count
        
    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)