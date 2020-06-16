from flask import Flask, request, render_template, redirect, jsonify
from flask_restful import Resource, Api
from Enums import QuestionType
from rutermextract import TermExtractor
import json
from pymystem3 import Mystem

class DialogAgentController():
    def __init__(self, api):
        api.add_resource(self.GetAnswer, '/api/GetAnswer')

    class GetAnswer(Resource):        
        def get(self):
            return {"api": ["Hello, World!"]}

        def post(self):
            json_data = request.get_json(force=True)
            graph = json_data['graph']
            question = json_data['question']
            answer = self.CreateAnswer(graph, question)
            return jsonify({ "answer": answer })

        # 1. Как связан А с Б?
        # 2. Связал ли А с Б?
        def CreateAnswer(self, nodes, question):
            if question.find("Как связан") >= 0 or question.find("как связан") >= 0:
                # First type of question
                return self.PerformAnswer(nodes, question, QuestionType.GetRelation)
            elif question.find("Связан") >= 0 or question.find("связан") >= 0:
                return self.PerformAnswer(nodes, question, QuestionType.IsRelated)
                # Second type
            return None

        def PerformAnswer(self, nodes, question, type):
            relations = {}
            if type == QuestionType.GetRelation:
                quest = question[11:].lstrip()
            elif type == QuestionType.IsRelated:
                quest = question[7:].lstrip()

            if quest.endswith('?'):
                quest = quest[:-1]
            words = quest.split(' ')
            indexS = -1
            for i in range(len(words)):
                if words[i] == "с":
                    indexS = i

            A = []
            B = []
            for i in range(len(words)):
                if i < indexS:
                    A.append(words[i])
                elif i > indexS:
                    B.append(words[i])
            
            relations = list(filter(lambda x: self.lambdaFunc(x, A, B), nodes))
            result = None
            if len(relations) > 0:
                result = {}
                result.update({"relation": relations[0]["relation"]})
                result.update({"parent": relations[0]["parent"]})
                result.update({"name": relations[0]["name"]})

            if type == QuestionType.GetRelation:
                return result
            elif type == QuestionType.IsRelated:
                return True if result is not None else False

        def lambdaFunc(self, node, A, B):
            # A - is array
            # B - is array
            # item - is object
            m = Mystem()
            if (node["parent"] == "null"):
                return False
            nodeName = ''.join(m.lemmatize(str(node["name"])))
            parentName = ''.join(m.lemmatize(str(node["parent"])))
            lemA = list(map(lambda x: m.lemmatize(str(x))[0], A))
            lemB = list(map(lambda x: m.lemmatize(str(x))[0], B))
            AInNodeName = True
            AInParentName = True
            BInNodeName = True
            BInParentName = True
            for lem in lemA:
                if lem.upper() not in nodeName.upper():
                    AInNodeName = False

            for lem in lemA:
                if lem.upper()  not in parentName.upper():
                    AInParentName = False

            for lem in lemB:
                if lem.upper()  not in nodeName.upper():
                    BInNodeName = False 

            for lem in lemB:
                if lem.upper()  not in parentName.upper():
                    BInParentName =  False
            
            if AInNodeName is True and BInParentName is True or BInNodeName is True and AInParentName is True:
                return True
            else:
                return False
