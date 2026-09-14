import PropertyForm from "./PropertyForm";
import { axiosInstance } from "../app";
import { useNavigate } from "react-router-dom";

export default function AddLease(){
  const navigate = useNavigate();

  const fields = [
    { name:"area", label:"Area", required:true },
    { name:"location", label:"Location", required:true },
    { name:"sqft", label:"Sqft" }, // ✅ ADDED
    { name:"leaseAmount", label:"Lease Amount", type:"number", required:true },
    { name:"duration", label:"Duration (Years)", required:true },
    { name:"phone", label:"Phone", required:true }
  ];

  const submit = (data)=>{
    data.append("category","Lease");
    return axiosInstance.post("/properties", data, {
      headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` }
    });
  };

  return (
    <PropertyForm
      title="Add Lease Property"
      fields={fields}
      onSubmit={submit}
      navigate={navigate}
    />
  );
}