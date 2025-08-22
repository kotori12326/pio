/* ----
# Pio Plugin (Modified)
# By: Dreamer-Paul | Modified by Kotori
# Last Update: 2025.08.22
---- */

var Paul_Pio = function (prop) {
    const that = this;

    const current = {
        idol: 0,
        timeout: undefined,
        menu: document.querySelector(".pio-container .pio-action"),
        canvas: document.getElementById("pio"),
        body: document.querySelector(".pio-container"),
        root: document.location.protocol + "//" + document.location.hostname + "/"
    };

    const tools = {
        create: (tag, options) => {
            const el = document.createElement(tag);
            options.class && (el.className = options.class);
            return el;
        },
        rand: (arr) => arr[Math.floor(Math.random() * arr.length)],
        isMobile: () => {
            let ua = window.navigator.userAgent.toLowerCase();
            ua = ua.indexOf("mobile") || ua.indexOf("android") || ua.indexOf("ios");
            return window.innerWidth < 500 || ua !== -1;
        }
    };

    const elements = {
        greet: tools.create("span", { class: "pio-info" }), // 复用 info 样式
        skin: tools.create("span", { class: "pio-skin" }),
        close: tools.create("span", { class: "pio-close" }),
        dialog: tools.create("div", { class: "pio-dialog" }),
        show: tools.create("div", { class: "pio-show" })
    };

    current.body.appendChild(elements.dialog);
    current.body.appendChild(elements.show);

    const modules = {
        idol: () => {
            current.idol < (prop.model.length - 1) ? current.idol++ : current.idol = 0;
            return current.idol;
        },
        message: (text, options = {}) => {
            const { dialog } = elements;
            if (text.constructor === Array) {
                dialog.innerText = tools.rand(text);
            } else if (text.constructor === String) {
                dialog[options.html ? "innerHTML" : "innerText"] = text;
            } else {
                dialog.innerText = "输入内容出现问题了 X_X";
            }
            dialog.classList.add("active");
            current.timeout = clearTimeout(current.timeout) || undefined;
            current.timeout = setTimeout(() => {
                dialog.classList.remove("active");
            }, options.time || 3000);
        },
        destroy: () => {
            that.initHidden();
            localStorage.setItem("posterGirl", "0");
        }
    };

    this.destroy = modules.destroy;
    this.message = modules.message;

    const action = {
        welcome: () => {
            let text;
            if (prop.tips) {
                const hour = new Date().getHours();
                if (hour > 22 || hour <= 5) text = "夜深了，早点休息哦~";
                else if (hour > 5 && hour <= 8) text = "早上好！";
                else if (hour > 8 && hour <= 11) text = "上午好！记得多喝水~";
                else if (hour > 11 && hour <= 14) text = "中午啦，该吃饭了！";
                else if (hour > 14 && hour <= 17) text = "下午好，有点困吗？动一动吧！";
                else if (hour > 17 && hour <= 19) text = "傍晚好，夕阳很美呢~";
                else if (hour > 19 && hour <= 21) text = "晚上好呀~";
                else if (hour > 21 && hour <= 23) text = "已经很晚了，早点休息吧";
                else text = prop.content.welcome || "欢迎来到本站！";
            } else {
                text = prop.content.welcome || "欢迎来到本站！";
            }
            modules.message(text);
        },

        touch: () => {
            current.canvas.onclick = () => {
                modules.message(prop.content.touch || ["不要碰我啦！", "HENTAI!", "你坏坏~"]);
            };
        },

        buttons: () => {
            // 问候按钮
            elements.greet.onclick = () => { action.welcome(); };
            elements.greet.onmouseover = () => { modules.message("点击和我打个招呼吧~"); };
            current.menu.appendChild(elements.greet);

            // 更换衣服按钮
            if (prop.model && prop.model.length > 0) {
                elements.skin.onclick = () => {
                    const nextIdol = modules.idol();
                    localStorage.setItem("posterGirlIdol", nextIdol);
                    loadlive2d("pio", prop.model[nextIdol]);
                    prop.content.skin && modules.message(prop.content.skin[1] || "新衣服真漂亮~");
                };
                elements.skin.onmouseover = () => {
                    prop.content.skin && modules.message(prop.content.skin[0] || "想看看我的新衣服吗？");
                };
                current.menu.appendChild(elements.skin);
            }

            // 关闭按钮
            elements.close.onclick = () => { modules.destroy(); };
            elements.close.onmouseover = () => {
                modules.message(prop.content.close || "QWQ 下次再见吧~");
            };
            current.menu.appendChild(elements.close);
        }
    };

    const begin = {
        static: () => current.body.classList.add("static"),
        fixed: () => { action.touch(); action.buttons(); },
        draggable: () => {
            action.touch();
            action.buttons();

            const body = current.body;
            const location = { x: 0, y: 0 };

            const mousedown = (ev) => {
                const { offsetLeft, offsetTop } = ev.currentTarget;
                location.x = ev.clientX - offsetLeft;
                location.y = ev.clientY - offsetTop;
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
            };

            const mousemove = (ev) => {
                body.classList.add("active");
                body.style.left = (ev.clientX - location.x) + "px";
                body.style.top = (ev.clientY - location.y) + "px";
                body.style.bottom = "auto";
            };

            const mouseup = () => {
                body.classList.remove("active");
                document.removeEventListener("mousemove", mousemove);
            };

            body.onmousedown = mousedown;
        }
    };

    this.init = (noModel) => {
        if (!(prop.hidden && tools.isMobile())) {
            if (!noModel) {
                action.welcome();
                let savedIdol = parseInt(localStorage.getItem("posterGirlIdol"));
                if (isNaN(savedIdol) || savedIdol < 0 || savedIdol >= prop.model.length) {
                    savedIdol = 0;
                }
                current.idol = savedIdol;
                loadlive2d("pio", prop.model[savedIdol]);

                // 设置默认显示位置，靠右下但不要太低
                current.body.style.right = "20px";
                current.body.style.bottom = "800px";
            }

            switch (prop.mode) {
                case "static": begin.static(); break;
                case "fixed": begin.fixed(); break;
                case "draggable": begin.draggable(); break;
            }

            prop.content.custom && action.custom && action.custom();
        }
    };

    this.initHidden = () => {
        if (prop.mode === "draggable") {
            current.body.style.top = null;
            current.body.style.left = null;
            current.body.style.bottom = null;
        }

        current.body.classList.add("hidden");
        elements.dialog.classList.remove("active");

        elements.show.onclick = () => {
            current.body.classList.remove("hidden");
            localStorage.setItem("posterGirl", "1");

            // 获取保存的衣服索引
            let savedIdol = parseInt(localStorage.getItem("posterGirlIdol"));
            if (isNaN(savedIdol) || savedIdol < 0 || savedIdol >= prop.model.length) {
                savedIdol = 0;
            }
            current.idol = savedIdol;

            // 只加载保存的衣服
            loadlive2d("pio", prop.model[savedIdol]);

            // 设置显示位置
            current.body.style.right = "20px";
            current.body.style.bottom = "800px";

            // 触发其他初始化操作（按钮、拖动等）
            switch (prop.mode) {
                case "static": current.body.classList.add("static"); break;
                case "fixed":
                    action.touch();
                    action.buttons();
                    break;
                case "draggable":
                    action.touch();
                    action.buttons();
                    const body = current.body;
                    const location = { x: 0, y: 0 };

                    const mousedown = (ev) => {
                        const { offsetLeft, offsetTop } = ev.currentTarget;
                        location.x = ev.clientX - offsetLeft;
                        location.y = ev.clientY - offsetTop;
                        document.addEventListener("mousemove", mousemove);
                        document.addEventListener("mouseup", mouseup);
                    };

                    const mousemove = (ev) => {
                        body.classList.add("active");
                        body.style.left = (ev.clientX - location.x) + "px";
                        body.style.top  = (ev.clientY - location.y) + "px";
                        body.style.bottom = "auto";
                    };

                    const mouseup = () => {
                        body.classList.remove("active");
                        document.removeEventListener("mousemove", mousemove);
                    };

                    body.onmousedown = mousedown;
                    break;
            }
        };
    };

    // 根据 localStorage 决定是否隐藏
    localStorage.getItem("posterGirl") === "0" ? this.initHidden() : this.init();
};

// 请保留版权说明
if (window.console && window.console.log) {
    console.log(
        "%c Pio %c https://paugram.com ",
        "color: #fff; margin: 1em 0; padding: 5px 0; background: #673ab7;",
        "margin: 1em 0; padding: 5px 0; background: #efefef;"
    );
}
