
import './index.less';
import './common.less';
import { add, minus } from "./math";
add(2, 3)

if (module && module.hot) {
    module.hot.accept()
}

//index.js
if (DEV === 'dev') {
    //开发环境
} else {
    //生产环境
}

class Animal {
    constructor(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
}

const dog = new Animal('dog');
document.onclick = function () {
    // 按需加载
    console.log(222);
    import('./test.js').then(fn => fn.default())
}

fetch("/User")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));


fetch("/login/account", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: "admin",
        password: "888888"
    })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err)); 