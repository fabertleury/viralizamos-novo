import fetch from 'node-fetch';
const url = "https://phfwfhfukfrcbfqshkuq.supabase.co/rest/v1/";
fetch(url)
  .then(res => res.text())
  .then(console.log)
  .catch(console.error); 