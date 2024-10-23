import { useContext, useState } from "react";
import './class.css';
import { Route, Routes } from "react-router-dom";
import ClassRoomMain from "./class_room";
import { AppContext } from "../../components/context";
import ClassRoomMaterial from "./material";
import { classRoomData, materialsData } from "../../config";

const ClassRoom = ({ search }) => {

    const { contract, setMessage } = useContext(AppContext);
    const [classRoom, setClassRoom] = useState(classRoomData);
    const [materials, setMaterials] = useState(materialsData);
    const [loaded, setLoaded] = useState({ class: false, materials: false });

    return (
        <div className="Class">
            <Routes>
                <Route 
                    path='/'
                    element={
                        <ClassRoomMain loaded={loaded} setLoaded={setLoaded}
                            classRoom={classRoom} materials={materials} 
                            setClassRoom={setClassRoom} setMaterials={setMaterials}
                        />
                    } 
                />

                <Route 
                    path='/:material_id'
                    element={
                        <ClassRoomMaterial loaded={loaded} setLoaded={setLoaded}
                            classRoom={classRoom} materials={materials} 
                            setClassRoom={setClassRoom}setMaterials={setMaterials}
                        />
                    } 
                />
            </Routes>
        </div>
    );
};

export default ClassRoom;