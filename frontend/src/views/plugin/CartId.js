function CartId() {
  const generateRandomString = () => {
    const length = 6;
    const characters = "1234567890";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    localStorage.setItem("randomString", randomString);
    return randomString;
  };

  const existingRandomString = localStorage.getItem("randomString");

  return existingRandomString || generateRandomString();
}
