from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Ensure CORS is enabled

from Re_ConECT import suspected_diagnoses, get_examination_and_red_flags, load_patient_info, save_patient_info, get_user_input

@app.route('/check_diagnosis', methods=['POST'])
def check_diagnosis():
    try:
        data = request.json
        print("Received /check_diagnosis request with data:", data)
        has_diagnosis = data.get('has_diagnosis', '').lower()
        if has_diagnosis == "yes":
            result = "get_rehabilitation_evaluation"
            return jsonify({"result": result})
        elif has_diagnosis == "no":
            result = "suspected_diagnoses"
            has_existing_info = True
            return jsonify({"result": result, "hasExistingInfo": has_existing_info})
        else:
            return jsonify({"error": "Invalid input. Please answer 'yes' or 'no'."}), 400
    except Exception as e:
        print("Error in /check_diagnosis:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/user_input', methods=['POST'])
def user_input():
    try:
        data = request.json
        print("Received /user_input request with data:", data)
        patient_info = data.get('patient_info', {})
        result, _ = suspected_diagnoses(patient_info)
        examination_result = get_examination_and_red_flags((result, True))
        return jsonify({"diagnosis": result, "examination": examination_result})
    except Exception as e:
        print("Error in /user_input:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/use_existing_info', methods=['POST'])
def use_existing_info():
    try:
        data = request.json
        print("Received /use_existing_info request with data:", data)
        use_existing = data.get('use_existing', False)
        if use_existing:
            patient_info = load_patient_info()
        else:
            patient_info = get_user_input()
            save_patient_info(patient_info)
        result = suspected_diagnoses(patient_info)
        examination_result = get_examination_and_red_flags(result)
        return jsonify({"diagnosis": result, "examination": examination_result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/")
def hello():
  return "Hello World!"  

if __name__ == '__main__':
    app.run(debug=True, port=5011)  # Changed port to 5011 and enabled debug mode