window.addEventListener('DOMContentLoaded', () => {

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

    const deadline = '2022-12-25';

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

if(slideIndex>10){
    current.innerHTML = slideIndex;
} else {
    current.innerHTML = '0'+ slideIndex;
}

slidesField.style.width = 100*slides.length + '%';
slides.forEach(i=> {
    i.style.width = width;
});

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
    
    if(slideIndex>10){
        current.innerHTML = slideIndex;
    } else {
        current.innerHTML = '0'+ slideIndex;
    }
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

    if(slideIndex>10){
    current.innerHTML = slideIndex;
    } else {
    current.innerHTML = '0'+ slideIndex;
    }
});



// showSlides(slideIndex);

// if(slides.length>10){
//     total.innerHTML = slides.length;
// } else {
//     total.innerHTML = '0'+ slides.length;
// }

// function showSlides(n){
//     if(n>slides.length){
//         slideIndex = 1; 
//     }

//     if(n<1){
//         slideIndex = slides.length;
//     }

//     slides.forEach(item => item.style.display = 'none');

//     slides[slideIndex-1].style.display = 'block';

//     if(slideIndex>10){
//         current.innerHTML = slideIndex;
//     } else {
//         current.innerHTML = '0'+ slideIndex;
//     }
// }

// function plusSlide(n){
//     showSlides(slideIndex+=n);
// }

// prev.addEventListener('click', ()=>{
//     plusSlide(-1)
// });
// next.addEventListener('click', ()=>{
//     plusSlide(+1)
// });
});
