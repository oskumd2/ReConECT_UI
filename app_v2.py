from flask import Flask, request, jsonify
from flask_cors import CORS
from waitress import serve
import os, re, csv, glob, json
import pandas as pd
from datetime import datetime
from Re_ConECT_v2 import suspected_diagnoses, calculate_7day_average, compare_scores, get_rehabilitation_evaluation, suspected_complications

app = Flask(__name__)
CORS(app)  # Ensure CORS is enabled

########
@app.route('/exist_id', methods=['POST'])
def exist_id():
    try:
        data = request.json
        print("Received /exist_id request with data:", data)
        patientinfo = data.get('patientinfo', '')
        exist_id = glob.glob(f"db_data/patient_info_{patientinfo[0]}_*.json")
        if(exist_id):
            return jsonify({"exist_id": True})
        else:
            return jsonify({"exist_id": False})
    except Exception as e:
        print("Error in /exist_id:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/valid_id', methods=['POST'])
def valid_id():
    try:
        data = request.json
        print("Received /valid_id request with data:", data)
        patientinfo = data.get('patientinfo', '')
        exist_id = glob.glob(f"db_data/patient_info_{patientinfo[0]}_*.json")
        exist_password =glob.glob(f"db_data/patient_info_{patientinfo[0]}_{patientinfo[1]}.json")

        if(exist_id and exist_password):
            return jsonify({"valid_id": True, "valid_password": True})
        elif(exist_id and not exist_password):
            return jsonify({"valid_id": True, "valid_password": False})
        else:
            return jsonify({"valid_id": False, "valid_password": False})
    except Exception as e:
        print("Error in /valid_id:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/user_input', methods=['POST'])
def user_input():
    try:
        data = request.json
        print("Received /user_input request with data:", data)
        patient_info = data.get('patient_info', {})
        ID = data.get('ID', {})
        Password = data.get('Password', {})

        result = suspected_diagnoses(patient_info, ID, Password)
        return jsonify({"diagnosis": result})
    except Exception as e:
        print("Error in /user_input:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/use_existing_info', methods=['POST'])
def use_existing_info():
    try:
        data = request.json
        print("Received /use_existing_info:", data)
        ID = data.get('ID', {})
        Password = data.get('Password', {})
        with open(f"db_data/patient_info_{ID}_{Password}.json", 'r') as f:
            patient_info = json.load(f)

        result = suspected_diagnoses(patient_info, ID, Password)
        return jsonify({"diagnosis": result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500

################
@app.route('/R_exist_id', methods=['POST'])
def R_exist_id():
    try:
        data = request.json
        print("Received /R_exist_id request with data:", data)
        patientinfo = data.get('patientinfo', '')
        exist_id = glob.glob(f"db_data/{patientinfo[0]}_*_info.txt")
        if(exist_id):
            return jsonify({"exist_id": True})
        else:
            return jsonify({"exist_id": False})
    except Exception as e:
        print("Error in /R_exist_id:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/R_valid_id', methods=['POST'])
def R_valid_id():
    try:
        data = request.json
        print("Received /R_valid_id request with data:", data)
        patientinfo = data.get('patientinfo', '')
        exist_id = glob.glob(f"db_data/{patientinfo[0]}_*_info.txt")
        exist_password =glob.glob(f"db_data/{patientinfo[0]}_{patientinfo[1]}_info.txt")

        if(exist_id and exist_password):
            return jsonify({"valid_id": True, "valid_password": True})
        elif(exist_id and not exist_password):
            return jsonify({"valid_id": True, "valid_password": False})
        else:
            return jsonify({"valid_id": False, "valid_password": False})
    except Exception as e:
        print("Error in /R_valid_id:", str(e))
        return jsonify({"error": str(e)}), 500
    

@app.route('/File_exists', methods=['POST'])
def file_exists():
    try:
        data = request.json
        print("Received /File_exists:", data)
        diagnosis_id = data.get('diagnosis_id', {})
        Password = data.get('Password', {})

        txt_file_path = f'db_data/{diagnosis_id}_{Password}_info.txt'
        with open(txt_file_path, 'r') as file:
            diag_dis = file.read().splitlines()
            diagnosis = diag_dis[0]
            line = diag_dis[1]
            disabilities = re.split(r'\s*,\s*', line) if ',' in line else [line]

        file_path = [""]*len(disabilities)
        today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY

        disabilities_q_num ={'Cognition':30,'UpperExtremity':7,'Movement':4}
        result =[]
        result_str = ""

        for i in range(len(disabilities)):
            file_path[i] = f'db_data/{diagnosis_id}_{disabilities[i]}.csv'

            if os.path.exists(file_path[i]):
                df = pd.read_csv(file_path[i], parse_dates=['datetime'])
                df['datetime'] = pd.to_datetime(df['datetime'])
                today_data = df[df['datetime'].dt.strftime("%m/%d/%Y") == today]
                if today_data.empty:
                    result += [disabilities[i]] 
            else:
                with open(file_path[i], 'w', newline='') as file:
                    writer = csv.writer(file)
                    headers = ['datetime'] + [f'Item {i}' for i in range(1, disabilities_q_num[disabilities[i]]+1)]
                    writer.writerow(headers)
                result_str += "\n"+file_path[i]+" has been created."  
                result += [disabilities[i]] 
        if result == []:
            result_str += "\n Loaded today's scores ("+today+") from existing file."
        else:
            result_str += "\n No scores for "+str(result)+" found for today ("+today+"). From now on, you will input current scores for each item."
        result_str += '\n Press any keys to Proceed.'
        return jsonify({"empty_disabilities": result, "result_str": result_str, "diagnosis": diagnosis, "disabilities": disabilities})
    except Exception as e:
        print("Error in /File_exists:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/Get_item_scores', methods=['POST'])
def get_item_scores():
    try:
        data = request.json
        print("Received /Get_item_scores:", data)
        emptyDisabilities = data.get('emptyDisabilities', {})
        answers = data.get('answers', {})
        diagnosis_id = data.get('diagnosis_id', {})

        today = datetime.now().strftime("%m/%d/%Y")
        file_path = [""]*len(emptyDisabilities)

        for i in range(len(emptyDisabilities)):
            file_path[i] = f'db_data/{diagnosis_id}_{emptyDisabilities[i]}.csv'
            new_row = [today]+answers[i]
            new_df = pd.DataFrame([new_row], columns=['datetime'] + [f'Item {i}' for i in range(1, len(answers[i])+1)])
            
            existing_df = pd.read_csv(file_path[i])
            updated_df = pd.concat([existing_df, new_df], ignore_index=True)
            updated_df.to_csv(file_path[i], index=False, date_format='m/%d/%Y')            
        result = " Completed."
        return jsonify({"result": result})
    except Exception as e:
        print("Error in /Get_item_scores:", str(e))
        return jsonify({"error": str(e)}), 500    

@app.route('/Input_item_scores', methods=['POST'])
def input_item_scores():
    try:
        data = request.json
        print("Received /Input_item_scores:", data)
        diagnosis_id = data.get('diagnosis_id', {})
        Password = data.get('Password', {})

        txt_file_path = f'db_data/{diagnosis_id}_{Password}_info.txt'
        with open(txt_file_path, 'r') as file:
            line = file.read().splitlines()[1]
            disabilities = re.split(r'\s*,\s*', line) if ',' in line else [line]

        today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY
        file_path,today_data, = [""]*len(disabilities),[""]*len(disabilities)
        latest_scores,average_scores, decreased_items = [""]*len(disabilities),[""]*len(disabilities),[""]*len(disabilities)

        for i in range(len(disabilities)):
            file_path[i] = f'db_data/{diagnosis_id}_{disabilities[i]}.csv'
            df = pd.read_csv(file_path[i], parse_dates=['datetime'])
            df['datetime'] = pd.to_datetime(df['datetime'])
            today_data[i] = df[df['datetime'].dt.strftime("%m/%d/%Y") == today]
            latest_scores[i] = [int(score) for score in today_data[i].iloc[-1, 1:].tolist()]
            average_scores[i] = calculate_7day_average(file_path[i])
            decreased_items[i] = compare_scores(latest_scores[i], average_scores[i])
        return jsonify({"decreased_items": decreased_items})
    except Exception as e:
        print("Error in /Input_item_scores:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/Get_rehabilitation_evaluation', methods=['POST'])
def get_rehabilitation_eval():
    try:
        data = request.json
        print("Received /Get_rehabilitation_evaluation:", data)
        decreased_items = data.get('decreased_items', {})
        disabilities = data.get('disabilities', {})
        result = get_rehabilitation_evaluation(decreased_items, disabilities)
        return jsonify({"result": result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500    

@app.route('/Update_patient_info', methods=['POST'])
def update_patient_info():
    try:
        data = request.json
        print("Received /Update_patient_info:", data)
        patient_info = data.get('patient_info', {})
        diagnosis_id = data.get('diagnosis_id', {})
        Password = data.get('Password', {})

        file_path = f'db_data/{diagnosis_id}_{Password}_info.txt'
        # Save the patient info to a file
        with open(file_path, 'w') as file:
            file.write('\n'.join(patient_info))    
        result= "Completed"
        return jsonify({"result": result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500    

@app.route('/complications_input', methods=['POST'])
def complications_input():
    try:
        data = request.json
        print("Received /complications_input request with data:", data)
        patient_info = data.get('patient_info', {})
        diagnosis = data.get('diagnosis', {})
        result = suspected_complications(patient_info, diagnosis)
        return jsonify({"diagnosis": result})
    except Exception as e:
        print("Error in /user_input:", str(e))
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0',port=5000)