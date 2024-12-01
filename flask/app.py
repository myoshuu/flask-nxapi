import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# NX-API URL
url = "https://sbx-nxos-mgmt.cisco.com/ins"
headers = {"Content-Type": "application/json"}

# Function to get device info
def get_device_info(switchuser, switchpassword):
    payload = {
        "ins_api": {
            "version": "1.0",
            "type": "cli_show",
            "chunk": "0",
            "sid": "1",
            "input": "show version",
            "output_format": "json"
        }
    }

    try:
        response = requests.post(url, headers=headers, auth=(switchuser, switchpassword), data=json.dumps(payload), verify=False)
        print("Device Info Response: ", response.text) 
        response_json = response.json()
        return response_json
    except Exception as e:
        return {"error": str(e)}

def get_vlan_info(switchuser, switchpassword):
    payload = {
        "ins_api": {
            "version": "1.0",
            "type": "cli_show",
            "chunk": "0",
            "sid": "1",
            "input": "show vlan",
            "output_format": "json"
        }
    }

    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers, auth=(switchuser, switchpassword), verify=False)
        print("VLAN Info Response: ", response.text) 
        response_json = response.json()
        vlan_list = response_json["ins_api"]["outputs"]["output"]["body"]["TABLE_vlanbrief"]["ROW_vlanbrief"]
        return vlan_list
    except Exception as e:
        return {"error": str(e)}

def get_interface_info(switchuser, switchpassword):
    payload = {
        "ins_api": {
            "version": "1.0",
            "type": "cli_show",
            "chunk": "0",
            "sid": "1",
            "input": "show interface brief",
            "output_format": "json"
        }
    }

    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers, auth=(switchuser, switchpassword), verify=False)
        print("Interface Info Response: ", response.text)  
        response_json = response.json()
        interface_list = response_json["ins_api"]["outputs"]["output"]["body"]["TABLE_interface"]["ROW_interface"]
        return interface_list
    except Exception as e:
        return {"error": str(e)}

def get_non_vlan_info(switchuser, switchpassword):
    all_interfaces = get_interface_info(switchuser, switchpassword)

    if "error" in all_interfaces:
        return all_interfaces

    non_vlan_interfaces = []

    for interface in all_interfaces:
        if "vlan" not in interface or not interface["vlan"]:
            non_vlan_interfaces.append(interface)

    print("Non-VLAN Interfaces: ", non_vlan_interfaces)
    return non_vlan_interfaces

@app.route('/device', methods=['POST'])
def device_info():
    switchuser = request.json.get('username')
    switchpassword = request.json.get('password')
    interface_type = request.json.get('interface_type', 'all')
    
    device_info_data = get_device_info(switchuser, switchpassword)

    if interface_type == "vlan":
        interface_info = get_vlan_info(switchuser, switchpassword)
    elif interface_type == "non-vlan":
        interface_info = get_non_vlan_info(switchuser, switchpassword)
    else:
        interface_info = get_interface_info(switchuser, switchpassword)

    if "error" in device_info_data or "error" in interface_info:
        return jsonify({"msg": "Error fetching data", "device_info": device_info_data, "interface_info": interface_info}), 500

    return jsonify({
        "device_info": device_info_data,
        "interface_info": interface_info
    }), 200

if __name__ == "__main__":
    app.run(debug=True)
