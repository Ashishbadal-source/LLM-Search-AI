let prevNoseY = null;

// let totalFrames = 0;
// let smileFrames = 0;
// let unsmile = 0;

const LEFT_EYE_EAR = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_EAR = [362, 385, 387, 263, 373, 380];
const EAR_THRESHOLD = 0.22;  // 👁️ Tune this if needed

let blinkCounter = 0;
let blinkActive = false;


const LEFT_IRIS = 468;
const RIGHT_IRIS = 473;
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;
const NOSE_TIP = 1;

let lookFrames = 0;
let lookTotalFrames = 0;

function getMovement(landmarks) {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const nose = landmarks[1];

    const distToLeftEye = Math.abs(nose.x - leftEye.x);
    const distToRightEye = Math.abs(nose.x - rightEye.x);

    let turn = "Facing Forward";
    if (distToLeftEye > distToRightEye + 0.04) turn = "Looking Right";
    else if (distToRightEye > distToLeftEye + 0.04) turn = "Looking Left";

    const eyeMid = {
        x: (leftEye.x + rightEye.x) / 2,
        y: (leftEye.y + rightEye.y) / 2,
        z: (leftEye.z + rightEye.z) / 2
    };
    const vector = {
        x: nose.x - eyeMid.x,
        y: nose.y - eyeMid.y,
        z: nose.z - eyeMid.z
    };
    const yawRadians = Math.atan2(vector.x, -vector.z);
    const yawDegrees = yawRadians * (180 / Math.PI);

    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const tiltAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    let movement = "Straight";
    if (tiltAngle > 5) movement = "Tilted Right";
    else if (tiltAngle < -5) movement = "Tilted Left";

    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    const nodAngle = (nose.y - eyeCenterY) * 100;
    let nod = "Straight";

    if (prevNoseY !== null) {
        const diffY = nose.y - prevNoseY;
        if (diffY > 0.015) nod = "Nodding Down";
        else if (diffY < -0.015) nod = "Nodding Up";
    }

    prevNoseY = nose.y;

    const msg = `${movement} | ${nod} | Tilt: ${tiltAngle.toFixed(2)}° | Nod: ${nodAngle.toFixed(2)}° | Yaw: ${yawDegrees.toFixed(2)}°`;

    const infoBox = document.getElementById("movement-info");
    if (infoBox) infoBox.innerText = msg;

    if (turn !== "Facing Forward") showLookStraightMessage();
    else hideLookStraightMessage();
}

function showLookStraightMessage() {
    if (!document.getElementById("look-straight-msg")) {
        const msg = document.createElement("div");
        msg.id = "look-straight-msg";
        msg.innerText = "👁️ Please look straight at the screen";
        msg.style.position = "fixed";
        msg.style.top = "55px";
        msg.style.right = "24px";
        msg.style.background = "#fff";
        msg.style.color = "red";
        msg.style.padding = "8px 12px";
        msg.style.borderRadius = "10px";
        msg.style.fontWeight = "bold";
        msg.style.boxShadow = "0px 2px 10px rgba(0,0,0,0.2)";
        msg.style.zIndex = "9999";
        document.body.appendChild(msg);
    }
}

function hideLookStraightMessage() {
    const msg = document.getElementById("look-straight-msg");
    if (msg) msg.remove();
}

function calculateDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function detectSmile(landmarks, smileFramesRef, unsmileRef, totalFramesRef) {
    // totalFrames++;
    totalFramesRef.current++;

    const MOUTH_LEFT = 61, MOUTH_RIGHT = 291, NOSE = 1, CHEEK_LEFT = 234, CHEEK_RIGHT = 454;
    const mouthLeft = landmarks[MOUTH_LEFT];
    const mouthRight = landmarks[MOUTH_RIGHT];
    const nose = landmarks[NOSE];
    const cheekLeft = landmarks[CHEEK_LEFT];
    const cheekRight = landmarks[CHEEK_RIGHT];

    const mouthWidth = calculateDistance(mouthLeft, mouthRight);
    const noseToCheekAvg = (calculateDistance(nose, cheekLeft) + calculateDistance(nose, cheekRight)) / 2;
    const smileScore = mouthWidth / noseToCheekAvg;

    const isSmiling = smileScore > 0.76;

    if (isSmiling) {
        // smileFrames++;
        smileFramesRef.current++;
        const counter = document.getElementById("smile-counter");
        if (counter) counter.innerText = `😊 Smiles: ${smileFramesRef.current}`;
    } else {
        // unsmile++;
        unsmileRef.current++;
        const counter = document.getElementById("unsmile-counter");
        if (counter) counter.innerText = `😐 Unsmiles: ${unsmileRef.current}`;
    }
}

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function calculateEAR(eyeIndices, landmarks) {
    const p1 = landmarks[eyeIndices[0]];
    const p2 = landmarks[eyeIndices[1]];
    const p3 = landmarks[eyeIndices[2]];
    const p4 = landmarks[eyeIndices[3]];
    const p5 = landmarks[eyeIndices[4]];
    const p6 = landmarks[eyeIndices[5]];

    const vertical1 = distance(p2, p6);
    const vertical2 = distance(p3, p5);
    const horizontal = distance(p1, p4);

    return (vertical1 + vertical2) / (2.0 * horizontal);
}

function detectBlink(landmarks) {
    const leftEAR = calculateEAR(LEFT_EYE_EAR, landmarks);
    const rightEAR = calculateEAR(RIGHT_EYE_EAR, landmarks);
    const avgEAR = (leftEAR + rightEAR) / 2.0;

    if (avgEAR < EAR_THRESHOLD) {
        if (!blinkActive) {
            blinkActive = true;
            blinkCounter++;
            console.log("👁️ Blink detected!", blinkCounter);
        }
    } else {
        blinkActive = false;
    }

    const blinkDisplay = document.getElementById("blink-counter");
    if (blinkDisplay) {
        blinkDisplay.innerText = `👁️ Blinks: ${blinkCounter}`;
    }
}

function detectCameraLook(landmarks) {
    lookTotalFrames++;

    const leftIris = landmarks[LEFT_IRIS];
    const rightIris = landmarks[RIGHT_IRIS];
    const leftEyeInner = landmarks[LEFT_EYE_INNER];
    const leftEyeOuter = landmarks[LEFT_EYE_OUTER];
    const rightEyeInner = landmarks[RIGHT_EYE_INNER];
    const rightEyeOuter = landmarks[RIGHT_EYE_OUTER];
    const nose = landmarks[NOSE_TIP];

    const leftRatio = (leftIris.x - leftEyeOuter.x) / (leftEyeInner.x - leftEyeOuter.x);
    const rightRatio = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);

    const eyeDirection =
        leftRatio < 0.42 && rightRatio < 0.42
            ? "Right"
            : leftRatio > 0.58 && rightRatio > 0.58
                ? "Left"
                : "Center";

    const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
    const headDirection =
        nose.x < eyeCenterX - 0.02
            ? "Looking Right"
            : nose.x > eyeCenterX + 0.02
                ? "Looking Left"
                : "Straight";

    const isLooking = headDirection === "Straight" && eyeDirection === "Center";

    if (isLooking) {
        lookFrames++;
    }
    // 🔴 Optional live status (append or overwrite existing info box)
    const infoBox = document.getElementById("movement-info");
    if (infoBox) {
        infoBox.innerText += ` | Eyes: ${eyeDirection} | ${isLooking ? "👀 Looking" : "🚫 Not Looking"}`;
    }
    const lookInfo = document.getElementById("look-info");
    if (lookInfo) {
        lookInfo.innerText = `👁️ Looking Frames: ${lookFrames} / ${lookTotalFrames}`;
    }
}

export { getMovement, showLookStraightMessage, hideLookStraightMessage, calculateDistance, detectSmile, detectBlink, distance, calculateEAR, detectCameraLook };