window.wait = async function (waitFunction, ms) {
    let retry = 0;
    while (waitFunction() && retry < 10) {
        await new Promise((r) => setTimeout(r, ms));
        retry++;
    }
};