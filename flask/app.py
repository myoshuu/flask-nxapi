import os
import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# NX-API URL
url = "https://sbx-nxos-mgmt.cisco.com/ins";
headers = {"Content-Type": "application/json"}


def deviceInfo(switchuser, switchpassword):
    # Payload
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
      response = requests.post(url, headers=headers, auth=(switchuser, switchpassword), data=json.dumps(payload), verify=False).json()

      return response
    
    except Exception as e:
      return e
    
def vlanInfo(switchuser, switchpassword):
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
    response = requests.post(
        url,
        data=json.dumps(payload),
        headers=headers,
        auth=(switchuser, switchpassword),
        verify=False
    ).json()

    vlan_list = response["ins_api"]["outputs"]["output"]["body"]["TABLE_vlanbriefxbrief"]["ROW_vlanbriefxbrief"]
    return vlan_list

  except Exception as e:
      return {"error": str(e)}
    
def interfaceInfo(switchuser, switchpassword):
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
    response = requests.post(
        url,
        data=json.dumps(payload),
        headers=headers,
        auth=(switchuser, switchpassword),
        verify=False
    ).json()

    interface_list = response["ins_api"]["outputs"]["output"]["body"]["TABLE_interface"]["ROW_interface"]
    return interface_list
  
  except Exception as e:
    return {"error": str(e)}