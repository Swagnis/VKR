from enum import Enum

class Rules(Enum):
    NotShorter = "0"
    NotLonger = "1"
    NotLessWordsInCollocation = "2"
    NotMoreWordsInCollocation = "3"
    NotLessWeight = "4"
    NotMoreWeight = "5"

class Languages(Enum):
    Russian = "0"
    English = "1"

class QuestionType(Enum):
    GetRelation = 0
    IsRelated = 1