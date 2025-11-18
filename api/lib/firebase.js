import admin from "firebase-admin";

// directly embed your service account JSON
const serviceAccount = {
  "type": "service_account",
  "project_id": "kanri-923d1",
  "private_key_id": "a2a87d9bc0236ffcfb3ea66375b07e562f7b037a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCIlIvWfAVxfhfm\nJUeGPGUNayqEtHwNIv1Ol9cuxVr5O/a7GrRM8fd9IAnP8qWwuSp9xpTAWbOhMbcp\nrbu+5HrcTwT56gyvOaQ/tU8w+Of5AHmMkuf2gwAbXJcOZJGJgUOAdEN2SvP4Z7I1\nL27b/wuDmdO9nBSzSN5fohMJmpuytYu35p32a5M/gbXUGvkOrydFUPmBVT7BiZr+\nZpkmda6yzf1WAn2G/Z9OdLPfBjEEuKBSW1wYu/j2bD7hoqgwbCJ/4NlIEAgizkGV\na21u2HrfxDj9fvgekqVCa3t0+FWIsC4CKdAaTJbhkwBYE2b7yLOeHpr8ATZ0tV2L\nHUzs+X0NAgMBAAECggEALPXpirPM/u1pZKPFBdV/1oj+uCzJ4XExPdwSRB1Hs2Af\n+rvxupq0xAX19PSFwsVRzZG/igp9bYT2LMw6T77bCwcgNjzr7ArnnOlMpmxpwLh9\nSt9ZaPb65Ab42w4UMtXQqMqdIqXN5moMaiGxNs6gtbO/1l05G0PToFu0NKcmtg8+\nT/G8BsCclpICapEDGC/x3eQvdly/Mx6qmFLiFy49GF++W92gZrHEISV+1Evmfw4u\nlNefe07YcLTfGJmjbU094HDmdSH3uyM2SYetXh7nuclBM9aNmoo/RKSdbQIxVLHR\nQgzeTDhEfjhpAofRm4S1jV//ZXycjvsQ5oV5jr4EqQKBgQC8jq1W5Bls74zpUY3X\n5yvzqil9YcOR7lWi+ZcEh1FGE9DHZAEQDeZSSuZowPk2UX1qQVMiH2+2586NoVVD\nPZRA6lTTGgWDUIwQUJRjm97Nel/jSP1ekGuPxy5VoB1+c22RUbd3QCvLEZv8KlOi\nUuuKXBsmPE32A+FXhG+bXy7SHwKBgQC5bpGiGk+kURCHuh2FSlC/Auk+JuBIFUZ1\nq17AntqAzAXjVoMM1NaGk9o8qroYyANBO3aHu8GX5uuJXQ6fRXibGmQYhkXKsyJl\n5fVz1qye1wi9f0EB2Hvhr+DgOqu6QvR2Vuc/hE42FGXnEmA+gkuTIGPlFGyfuwsh\nm54l4wsDUwKBgDlGUYraQIrhfPkGR8K0OpqKLo4iWyiBr8uQavn6LIrPzBQ04UnC\nHxsSG0jojQqd2C2laB4uVF3HretBfUeuddD+HQP+nHwVxGXURC65kwTxTh0Y97V4\nwuNqij2CJFNbtoV0v/jeKi9Fyw7ewIbHDzr43VpQ6RF4fkN6O/iDAhLbAoGAdMmK\nt4nSty7HNnSluxk/Gc5/kEFz6HJd2iaAmthxzcSxwKjwCNjT9BaS0LrGUm1Gf4Mv\n9/TszPsHRZBycSWT/Dv25utKcYu5Emxu1vJR7giI3LCVBNCP1WisPQ02sy0QQqgh\nJQPzLmRSeeI886Gkb5lq0RC4CTIIpLYaOMpyWTkCgYEAjSOZxFImDXB+Di6bLyJ3\nDa9rwnJBpn671/bm/cNx3M3AecMyPv5BVDgaXXKgpxGNNtR6KSi5tr7/F+VEMbnR\nXNb4NIx89zbcLe+aWyeWrU7FrjA8PDqpHVH8t+IKhzg1Kp/akMS8TWWbOuz3tUC9\nfUebJqtuYV7s5CzxJgCw0pc=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@kanri-923d1.iam.gserviceaccount.com",
  "client_id": "118070187339948592239",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40kanri-923d1.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const tdb = admin.firestore();
