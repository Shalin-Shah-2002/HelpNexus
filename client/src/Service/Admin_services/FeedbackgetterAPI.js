import axios from 'axios';

const Base_URL = "http://localhost:5000/api";

const getallFeedback = async () => {
    try {
        const res = await axios.get(`${Base_URL}/getallfeedbacks`);
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

export { getallFeedback };