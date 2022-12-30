window.addEventListener('DOMContentLoaded', () => {
    //Tabs

    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(tab => {
            tab.classList.add('hide');
            tab.classList.remove('show', 'fade');
        });
        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        })
    }
    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }
    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (e) => {
        const target = e.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((tab, i) => {
                if (target == tab) {
                    hideTabContent();
                    showTabContent(i);
                }
            })
        }
    });


    //Timer

    const deadline = '2023-03-25';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60)) % 24),
            minutes = Math.floor((t / (1000 * 60)) % 60),
            seconds = Math.floor((t / 1000) % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        }
    }

    function getZero(n) {
        if (n >= 0 && n < 10) {
            return `0${n}`;
        } else {
            return n
        }
    }

    function setTimer(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateTimer, 1000);

        updateTimer();

        function updateTimer() {
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
                timer.innerHTML = 'Акция завершена!';
                timer.classList.remove('timer');
                timer.classList.add('end__promotion');
            }
        }
    }

    setTimer('.timer', deadline)


    //Modal

    const btnModal = document.querySelectorAll('[data-modal]');
    const modal = document.querySelector('.modal');

    function openModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimer);
    }
    btnModal.forEach(btn => {
        btn.addEventListener('click', openModal)
    });

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'scroll';
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    const modalTimer = setTimeout(openModal, 50000);

    function showModalInTHeEnd() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalInTHeEnd);
        }
    }

    window.addEventListener('scroll', showModalInTHeEnd);

    //Cards

    class Card {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');
            if (this.classes.length === 0) {
                this.element = 'menu__item'
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            element.innerHTML = `
                    <img src=${this.src} alt=${this.alt}>
                    <h3 class="menu__item-subtitle">${this.title}</h3>
                    <div class="menu__item-descr">${this.descr}</div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена:</div>
                        <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                    </div>
                `;
            this.parent.append(element);
        }
    }

    axios.get('http://localhost:3000/menu')
        .then(data => data.data.map(({ img, alt, title, descr, price }) => {
            new Card(img, alt, title, descr, price, '.menu .container').render()
        }));


    // Forms
    const forms = document.querySelectorAll('form');
    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: { 'Content-type': 'application/json' },
            body: data
        });

        return await res.json();
    }

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.classList.add('spinner');

            form.insertAdjacentElement('afterend', statusMessage)

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
                .then(() => {
                    showThanksModal(message.success);
                    statusMessage.remove();
                }).catch(() => {
                    showThanksModal(message.failure);
                }).finally(() => {
                    form.reset();
                })
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
        <div class="modal__close" data-close>x</div>
        <div class="modal__title">${message}</div>
        </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000)
    }

    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res))



    //Slider

const slides = document.querySelectorAll('.offer__slide'),
slider = document.querySelector('.offer__slider'),
slidesWrapper = document.querySelector('.offer__slider-wrapper'),
slidesField = document.querySelector('.offer__slider-inner'),
width = window.getComputedStyle(slidesWrapper).width,
prev = document.querySelector('.offer__slider-prev'),
next = document.querySelector('.offer__slider-next'),
current = document.querySelector('#current'),
total = document.querySelector('#total');

let offset = 0;
let slideIndex = offset+1;

if(slides.length>10){
    total.innerHTML = slides.length;
} else {
    total.innerHTML = '0'+ slides.length;
}

function currentSlide(){
    if(slideIndex>10){
        current.innerHTML = slideIndex;
        } else {
        current.innerHTML = '0'+ slideIndex;
        }
}
currentSlide();

slidesField.style.width = 100*slides.length + '%';
slides.forEach(i=> {
    i.style.width = width;
});

slider.style.position = 'relative';

const dots = document.createElement('ol'),
    dotsArr = [];
dots.classList.add('carousel-indicators');

slider.append(dots);

for(let i = 0; i < slides.length; i++){
    const dot = document.createElement('li');
    dot.setAttribute('data-slide-to', i+1);
    dot.classList.add('dot');
    if(i==0){
        dot.style.opacity = 1;
    }
    dots.append(dot);
    dotsArr.push(dot);
}

function dotStyles() {
    dotsArr.forEach(dot=>dot.style.opacity='.5');
    dotsArr[slideIndex-1].style.opacity = 1;
}

prev.addEventListener('click', ()=>{
    if(offset == 0){
        offset = +width.slice(0,width.length-2)*(slides.length-1);
    } else {
        offset -= +width.slice(0,width.length-2)
    }

    slidesField.style.transform = `translateX(-${offset}px)`;

    if(slideIndex == 1){
        slideIndex = slides.length;
    } else {
        slideIndex--;
    }
    
    currentSlide();
    dotStyles();
});
next.addEventListener('click', ()=>{
    if(offset == +width.slice(0,width.length-2)*(slides.length-1)){
        offset = 0;
    } else {
        offset += +width.slice(0,width.length-2)
    }

    slidesField.style.transform = `translateX(-${offset}px)`;

    if(slideIndex == slides.length){
        slideIndex = 1;
    } else {
        slideIndex++;
    }

    currentSlide();
    dotStyles();
});

dotsArr.forEach(dot=> {
    dot.addEventListener('click', (e)=>{
        const slideTo = e.target.getAttribute('data-slide-to');
        slideIndex = slideTo;

        offset = +width.slice(0,width.length-2)*(slideTo-1);

        slidesField.style.transform = `translateX(-${offset}px)`;

        currentSlide();
        dotStyles();
    })
})

//Calculator
const result = document.querySelector('.calculating__result span');
let sex, height, weight, age, ratio;

if(localStorage.getItem('sex')){
    sex = localStorage.getItem('sex')
} else {
    sex='female';
    localStorage.setItem('sex', 'female');
}

if(localStorage.getItem('ratio')){
    ratio = localStorage.getItem('ratio')
} else {
    ratio=1.375;
    localStorage.setItem('ratio', 1.375);
}

function initLocalSettings(selector, activeClass){
    const elems = document.querySelectorAll(selector);

    elems.forEach(el=>{
        el.classList.remove(activeClass);
        if(el.getAttribute('id')===localStorage.getItem('sex')){
            el.classList.add(activeClass);
        }
        if(el.getAttribute('data-ratio')===localStorage.getItem('ratio')){
            el.classList.add(activeClass);
        }
    });
}
initLocalSettings('#gender div', 'calculating__choose-item_active');
initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

function calcTotal(){
    if(!sex || !height||!weight||!age||!ratio){
        result.textContent = '____';
        return
    }
    if(sex === 'female'){
        result.textContent = Math.round((447.6 + 9.2 * weight + 3.1*height-4.3*age)*ratio)
    } else {
        result.textContent = Math.round((88.36 + 13.4 * weight + 4.8*height-5.7*age)*ratio)
    }
}
calcTotal();

function getStaticInfo(selector, activeClass){
const elements=document.querySelectorAll(selector);

elements.forEach(el=>{
    el.addEventListener('click', (e)=>{
        if(e.target.getAttribute('data-ratio')){
            ratio = +e.target.getAttribute('data-ratio');
            localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
        } else {
            sex= e.target.getAttribute('id');
            localStorage.setItem('sex', e.target.getAttribute('id'))
        }
    
        elements.forEach(el=>{
            el.classList.remove(activeClass);
        });
    
        e.target.classList.add(activeClass);
        calcTotal();
    });
});
}

getStaticInfo('#gender div', 'calculating__choose-item_active');
getStaticInfo('.calculating__choose_big div', 'calculating__choose-item_active');

function getDinamicInfo(selector){
    const input = document.querySelector(selector);

    input.addEventListener('input', () =>{

        if(input.value.match(/\D/g)){
            input.style.border = '1px solid red';
        } else {
            input.style.border = 'none';
        }

        switch(input.getAttribute('id')){
            case 'height':
                height=+input.value;
                break;
            case 'weight':
                weight=+input.value;
                break;
            case 'age':
                age=+input.value;
                break;
        }
        calcTotal();
    });
}
getDinamicInfo('#height');
getDinamicInfo('#weight');
getDinamicInfo('#age');
});


