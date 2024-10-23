import { useState } from "react";
import { fetchUrlPrieview, fetchUrlPrieviewLocal } from "./utils";

const TestingPreview = () => {
    const [url, setUrl] = useState('');
    function handleChange(e) { setUrl(e.target.value); };
    async function clickFn(e) {
        e.preventDefault();
        try {
            console.log('clicked');
            const res = await fetchUrlPrieview(url, 10000);
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <div className="tp" style={{ margin: '50px' }}>
            <input onChange={handleChange} />
            <button onClick={clickFn}>Send</button>
        </div>
    );
};

export default TestingPreview;