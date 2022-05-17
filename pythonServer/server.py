import numpy as np
import flask
import tensorflow_text as text
from google.protobuf import text_format
from flask import request, jsonify
import json
from flask_cors import CORS
from keras import backend as K
import tensorflow as tf
from tensorflow import keras

def balanced_recall(y_true, y_pred):
    """This function calculates the balanced recall metric
    recall = TP / (TP + FN)
    """
    recall_by_class = 0
    # iterate over each predicted class to get class-specific metric
    for i in range(y_pred.shape[1]):
        y_pred_class = y_pred[:, i]
        y_true_class = y_true[:, i]
        true_positives = K.sum(K.round(K.clip(y_true_class * y_pred_class, 0, 1)))
        possible_positives = K.sum(K.round(K.clip(y_true_class, 0, 1)))
        recall = true_positives / (possible_positives + K.epsilon())
        recall_by_class = recall_by_class + recall
    return recall_by_class / y_pred.shape[1]

def balanced_precision(y_true, y_pred):
    """This function calculates the balanced precision metric
    precision = TP / (TP + FP)
    """
    precision_by_class = 0
    # iterate over each predicted class to get class-specific metric
    for i in range(y_pred.shape[1]):
        y_pred_class = y_pred[:, i]
        y_true_class = y_true[:, i]
        true_positives = K.sum(K.round(K.clip(y_true_class * y_pred_class, 0, 1)))
        predicted_positives = K.sum(K.round(K.clip(y_pred_class, 0, 1)))
        precision = true_positives / (predicted_positives + K.epsilon())
        precision_by_class = precision_by_class + precision
    # return average balanced metric for each class
    return precision_by_class / y_pred.shape[1]

def balanced_f1_score(y_true, y_pred):
    """This function calculates the F1 score metric"""
    precision = balanced_precision(y_true, y_pred)
    recall = balanced_recall(y_true, y_pred)
    return 2 * ((precision * recall) / (precision + recall + K.epsilon()))

tensorflow_graph = tf.keras.models.load_model("./my_model2",custom_objects={"balanced_recall":balanced_recall, "balanced_precision":balanced_precision, "balanced_f1_score":balanced_f1_score})


def predict_class(reviews,tensorflow_graph):
  return [np.argmax(pred) for pred in tensorflow_graph.predict(reviews)]



#

app = flask.Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return "<h1>Hi Members</p>"
# "food":0, "cloth": 1, "game":2, "laptop":3, "watch":4
@app.route('/gettag', methods=['POST'])
def getuser():
    record = json.loads(request.data)
    
    data=predict_class([record['text']],tensorflow_graph)
    types=["food", "clothes", "games", "laptop", "watch"]
    print(types[data[0]])
    return jsonify({"type":types[data[0]]})
app.run(port=8000)