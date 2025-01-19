        let tape = [];
        let currentIndex = 0;
        let startState, transitionFunctions;
        let currentState;
        let intervalId;
        let history = [];

        const defaultMachines = {
            machine1: {
                startState: "q0",
                transitionFunctions: [
                    "q0,0,1,q0",
                    "q0,1,R,q0"
                ],
                description: "این ماشین تورینگ یک نمونه ساده است که رشته ورودی را به 1 تبدیل می‌کند.",
                finalAnswer: "111",
                explanation: "این ماشین تورینگ هر 0 را به 1 تبدیل می‌کند و در نهایت رشته ورودی را به 111 تبدیل می‌کند."
            },
            machine2: {
                startState: "q0",
                transitionFunctions: [
                    "q0,1,0,q0",
                    "q0,0,R,q0"
                ],
                description: "این ماشین تورینگ یک نمونه ساده است که رشته ورودی را به 0 تبدیل می‌کند.",
                finalAnswer: "000",
                explanation: "این ماشین تورینگ هر 1 را به 0 تبدیل می‌کند و در نهایت رشته ورودی را به 000 تبدیل می‌کند."
            },
            machine3: {
                startState: "q0",
                transitionFunctions: [
                    "q0,1,λ,q0",
                    "q0,λ,R,q1",
                    "q1,1,R,q1",
                    "q1,0,ε,q1",
                    "q1,ε,R,q2",
                    "q2,1,R,q2",
                    "q2,0,L,q3",
                    "q3,1,λ,q3",
                    "q3,λ,L,q4",
                    "q4,1,L,q4",
                    "q4,ε,L,q4",
                    "q4,λ,R,q5",
                    "q5,1,λ,q5",
                    "q5,λ,R,q6",
                    "q6,1,R,q6",
                    "q6,ε,R,q6",
                    "q6,λ,L,q7",
                    "q7,1,λ,q7",
                    "q7,λ,L,q8",
                    "q8,1,L,q9",
                    "q9,1,L,q9",
                    "q9,ε,L,q10",
                    "q10,λ,R,q10",
                    "q10,ε,R,q11",
                    "q11,1,0,q11",
                    "q11,0,R,q11",
                    "q10,1,L,q12",
                    "q12,1,L,q12",
                    "q12,λ,R,q5",
                ],
                description: "این ماشین تورینگ یک نمونه ساده است که رشته ورودی شامل دو عدد است را باهم تفریق میکند.",
                finalAnswer: "000",
                explanation: "در صورتی که صفر معادل 1، یک معادل 11، دو معادل 111، سه معادل 1111 و... باشد، و یک رشته شامل دو عدد که با یک صفر از هم جدا شده‌اند به ماشین داده شود، در انتهای محاسبه، تعداد 1های باقی‌مانده در نوار برابر با مجموع دو عدد ورودی خواهد بود. \nبرای مثال، اگر بخواهیم ماشین عددهای 2 و 3 را بدهیم، رشته‌ی 11101111 را به آن وارد می‌کنیم. \nپس از محاسبه ماشین، در نوار هفت عدد 1 باقی خواهند ماند که بزوما به هم چسبیده نیستند."
            }
        };

        function defineMachine() {
            startState = document.getElementById("startState").value.trim();
            transitionFunctions = document.getElementById("transitionFunction").value.split("\n").map(s => s.trim());
            currentState = startState;
            alert("ماشین تورینگ با موفقیت تعریف شد!");
        }

        function saveMachine() {
            const machine = {
                startState,
                transitionFunctions
            };
            const machineJson = JSON.stringify(machine);
            const blob = new Blob([machineJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "machine.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function loadMachine() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (event) => {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const machine = JSON.parse(e.target.result);
                    startState = machine.startState;
                    transitionFunctions = machine.transitionFunctions;
                    currentState = startState;
                    document.getElementById("startState").value = startState;
                    document.getElementById("transitionFunction").value = transitionFunctions.join("\n");
                    alert("ماشین تورینگ با موفقیت بازیابی شد!");
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function loadDefaultMachine() {
            const selectedMachine = document.getElementById("defaultMachines").value;
            if (selectedMachine && defaultMachines[selectedMachine]) {
                const machine = defaultMachines[selectedMachine];
                startState = machine.startState;
                transitionFunctions = machine.transitionFunctions;
                currentState = startState;
                document.getElementById("startState").value = startState;
                document.getElementById("transitionFunction").value = transitionFunctions.join("\n");
                document.getElementById("defaultMachineDescription").textContent = machine.description;
                document.getElementById("finalAnswerExplanation").textContent = machine.explanation;
                alert("ماشین تورینگ پیش‌فرض با موفقیت بارگذاری شد!");
            }
        }

        function initializeTape() {
            const inputString = document.getElementById("inputString").value;
            tape = ["0", "0", "0"].concat(inputString.split(""), ["0", "0", "0"]);
            currentIndex = 3; // هد روی اولین حرف رشته قرار می‌گیرد
            renderTape();
        }

        function renderTape() {
            const tapeContainer = document.getElementById("tape");
            tapeContainer.innerHTML = "";
            tape.forEach((cell, index) => {
                const cellDiv = document.createElement("div");
                cellDiv.className = "tape-cell";
                if (index === currentIndex) cellDiv.classList.add("current");
                cellDiv.textContent = cell;
                tapeContainer.appendChild(cellDiv);
            });
        }

        function stepExecution() {
            const currentSymbol = tape[currentIndex] || "0";

            // پیدا کردن تابع انتقال متناسب با فرمت جدید (چهارتایی)
            const transition = transitionFunctions.find(func => {
                const [state, readSymbol, , nextState] = func.split(",");
                return state === currentState && readSymbol === currentSymbol;
            });

            if (!transition) {
                document.getElementById("status").textContent = "وضعیت: انتقال معتبری یافت نشد. توقف...";
                return;
            }

            // تجزیه و اجرای تابع انتقال با فرمت جدید
            const [state, readSymbol, action, nextState] = transition.split(",");

            if (action === "R" || action === "L") {
                // حرکت هد بدون تغییر نوشتن نماد
                if (action === "R") {
                    if (tape.length - 1 > currentIndex)
                        currentIndex += 1;
                    else {
                        tape.push("0");  // اضافه کردن 0 در انتهای نوار
                        currentIndex = tape.length - 1;  // هد را به خانه دوم از آخر منتقل می‌کنیم
                    }
                } else if (action === "L") {
                    if (currentIndex > 0) {
                        currentIndex -= 1;
                    } else {
                        // اگر هد نمی‌تواند حرکت کند (در ابتدای نوار است)، شیفت دادن به جلو
                        tape.unshift("0");  // اضافه کردن 0 به ابتدای نوار
                        currentIndex = 0;  // هد را به خانه دوم از نوار منتقل می‌کنیم
                    }
                }
            } else {
                // نوشتن نماد روی نوار
                tape[currentIndex] = action;
            }

            currentState = nextState;

            renderTape();

            document.getElementById("currentStateDisplay").textContent = `وضعیت فعلی: ${currentState}`;
            document.getElementById("currentTransitionDisplay").textContent = `تابع انتقال قبلی: ${transition}`;

            // پیدا کردن تابع انتقال کنونی
            const nextTransition = transitionFunctions.find(func => {
                const [state, readSymbol, , nextState] = func.split(",");
                return state === currentState && readSymbol === tape[currentIndex];
            });

            if (nextTransition) {
                document.getElementById("nextTransitionDisplay").textContent = `تابع انتقال کنونی: ${nextTransition}`;
            } else {
                document.getElementById("nextTransitionDisplay").textContent = `تابع انتقال کنونی: هنوز تعریف نشده است`;
            }

            if (acceptStates.includes(currentState)) {
                document.getElementById("status").textContent = "وضعیت: پذیرفته شد!";
                document.getElementById("finalAnswer").textContent = `جواب نهایی: ${tape.join("")}`;
            } else {
                document.getElementById("status").textContent = `وضعیت: حالت جاری - ${currentState}`;
            }

            // ذخیره وضعیت فعلی برای بازگشت
            history.push({ tape: [...tape], currentIndex, currentState });
        }

        function resetMachine() {
            tape = [];
            currentIndex = 0;
            currentState = startState;
            document.getElementById("status").textContent = "وضعیت: منتظر ورودی...";
            document.getElementById("finalAnswer").textContent = "جواب نهایی شما در اینجا نمایش داده می‌شود.";
            document.getElementById("finalAnswerExplanation").textContent = "";
            document.getElementById("currentStateDisplay").textContent = "وضعیت فعلی: هنوز تعریف نشده است";
            document.getElementById("currentTransitionDisplay").textContent = "تابع انتقال قبلی: هنوز تعریف نشده است";
            document.getElementById("nextTransitionDisplay").textContent = "تابع انتقال کنونی: هنوز تعریف نشده است";
            renderTape();
            document.getElementById("loadingImage").style.display = "none";
            clearInterval(intervalId);
            history = [];
        }
