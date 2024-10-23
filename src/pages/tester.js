import { useState } from "react";
import { fetchUrlPrieview } from "../config";

const Tester = () => {
    const [val, setVal] = useState('');

    function handleChange(e) {
        setVal(e.target.value);
    }

    async function send(e) {
        const res = await fetchUrlPrieview(val);
        console.log(res);
    }

    return (
        <div className="Tester">
            <input placeholder="Scarpe" onChange={handleChange}/>
            <button onClick={send}>Send</button>
            
        </div>
    );
};

export default Tester;