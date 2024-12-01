/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [interfaceInfo, setInterfaceInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [interfaceType, setInterfaceType] = useState("all");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/device", {
        username,
        password,
      });

      if (response.data.device_info) {
        setIsLogin(true);
        setError("");
      } else {
        setIsLogin(false);
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  const fetchDeviceData = async () => {
    try {
      const response = await axios.post("http://localhost:5000/device", {
        username,
        password,
        interface_type: interfaceType,
      });

      setDeviceInfo(response.data.device_info);
      setInterfaceInfo(response.data.interface_info);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch device data");
    }
  };

  const renderDeviceInfoTable = (deviceInfo: any) => {
    const {
      chassis_id,
      cpu_name,
      memory,
      nxos_ver_str,
      kernel_version,
      host_name,
      manufacturer,
      plugins,
    } = deviceInfo?.ins_api?.outputs?.output?.body || {};

    return (
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {chassis_id && (
            <tr>
              <td>Chassis ID</td>
              <td>{chassis_id}</td>
            </tr>
          )}
          {cpu_name && (
            <tr>
              <td>CPU</td>
              <td>{cpu_name}</td>
            </tr>
          )}
          {memory && (
            <tr>
              <td>Memory</td>
              <td>{memory} KB</td>
            </tr>
          )}
          {nxos_ver_str && (
            <tr>
              <td>NX-OS Version</td>
              <td>{nxos_ver_str}</td>
            </tr>
          )}
          {kernel_version && (
            <tr>
              <td>Kernel Version</td>
              <td>{kernel_version}</td>
            </tr>
          )}
          {host_name && (
            <tr>
              <td>Host Name</td>
              <td>{host_name}</td>
            </tr>
          )}
          {manufacturer && (
            <tr>
              <td>Manufacturer</td>
              <td>{manufacturer}</td>
            </tr>
          )}
          {plugins && (
            <tr>
              <td>Plugins</td>
              <td>{plugins}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderAllInterfaceTable = (interfaceInfo: any) => {
    if (!interfaceInfo || interfaceInfo.length === 0)
      return <p>No interface data available</p>;

    return (
      <table>
        <thead>
          <tr>
            <th>Interface Name</th>
            <th>Port Mode</th>
            <th>Speed</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {interfaceInfo.map((interfaceItem: any, index: number) => (
            <tr key={index}>
              <td>{interfaceItem["interface"] || "N/A"}</td>
              <td>{interfaceItem["portmode"] || "N/A"}</td>
              <td>{interfaceItem["speed"] || "N/A"}</td>
              <td>{interfaceItem["type"] || "N/A"}</td>
              <td>{interfaceItem["state"] || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderVlanInterfaceTable = (vlanInterfaces: any) => {
    if (!vlanInterfaces || vlanInterfaces.length === 0)
      return <p>No VLAN data available</p>;

    return (
      <table>
        <thead>
          <tr>
            <th>VLAN ID</th>
            <th>VLAN Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vlanInterfaces.map((vlan: any, index: number) => (
            <tr key={index}>
              <td>{vlan["vlanshowbr-vlanid"]}</td>
              <td>{vlan["vlanshowbr-vlanname"]}</td>
              <td>{vlan["vlanshowbr-vlanstate"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderNonVlanInterfaceTable = (nonVlanInterfaces: any) => {
    if (!nonVlanInterfaces || nonVlanInterfaces.length === 0)
      return <p>No non-VLAN data available</p>;

    return (
      <table>
        <thead>
          <tr>
            <th>Interface Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {nonVlanInterfaces.map((interfaceItem: any, index: number) => (
            <tr key={index}>
              <td>{interfaceItem["interface"]}</td>
              <td>{interfaceItem["state"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {!isLogin ? (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Login</button>
          </form>
          {error && <p>{error}</p>}
        </div>
      ) : (
        <div>
          <h1>Device Information</h1>
          <div>
            <label>Choose Interface Type: </label>
            <select
              value={interfaceType}
              onChange={(e) => setInterfaceType(e.target.value)}
            >
              <option value="all">All Interfaces</option>
              <option value="vlan">VLAN Interfaces</option>
              <option value="non-vlan">Non-VLAN Interfaces</option>
            </select>
          </div>

          <button onClick={fetchDeviceData}>Get Device Data</button>

          {deviceInfo && (
            <div>
              <h2>Device Info</h2>
              {renderDeviceInfoTable(deviceInfo)}
            </div>
          )}

          {interfaceType === "vlan" && interfaceInfo && (
            <div>
              <h2>VLAN Interface Info</h2>
              {renderVlanInterfaceTable(interfaceInfo)}
            </div>
          )}

          {interfaceType === "non-vlan" && interfaceInfo && (
            <div>
              <h2>Non-VLAN Interface Info</h2>
              {renderNonVlanInterfaceTable(interfaceInfo)}
            </div>
          )}

          {interfaceType === "all" && interfaceInfo && (
            <div>
              <h2>All Interface Info</h2>
              {renderAllInterfaceTable(interfaceInfo)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
