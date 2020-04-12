import './styles.css';
import axios from 'axios';
import PNotify from 'pnotify/dist/es/PNotify.js';
import template from './templates/imageCard.hbs';
import debounce from 'lodash.debounce';

const url = `https://pixabay.com/api/?image_type=photo&orientation=horizontal`;
const key = `&key=15900106-2c235e732bb321ca7ec900d93`;
let page = 1;
const perPage = `&per_page=12`;

const input = document.querySelector( `input` );
const ul = document.querySelector( `.gallery` );
const modalDiv = document.querySelector( `.lightbox` );
const modalDivButton = document.querySelector( `button[data-action="close-lightbox"]` );
const modalImg = document.querySelector( `.modal-img` );
const nextPicture = document.querySelector( `.add-more` );
let query = ``;

input.addEventListener( `input`, debounce( getImages, 1000 ) );

const pnotifySet = {
    text: "We did not find any pictures for your request",
    delay: 4000,
    addClass: `warning`,
    width: '250px',
    remove: true,
    stack: {
        context: modalDiv
    },
}

function getImages ( event ) {
    query = `&q=${event.target.value}`;
    ul.innerHTML = ``;
    PNotify.error( `` );
    nextPicture.style.visibility = `hidden`;
    axios.get( `${url}${query}&page=${page}${perPage}${key}` )
        .then( response => {
            const data = response.data.hits;
            if( data.length >= 1 ) {
                nextPicture.style.visibility = `visible`;
            }
            if( data.length < 11 ) {
                nextPicture.disabled = true;
            }
            if( data.length === 0 ) {
                PNotify.error( pnotifySet );
            }
            const markup = data.reduce( ( acc, el ) => acc + `<li class="image-card">${template( el )}</li>`, `` );
            ul.insertAdjacentHTML( `beforeend`, markup );
        } )
    nextPicture.addEventListener( `click`, addNewPictures )
}

function addNewPictures () {
    page += 1;
    axios.get( `${url}${query}&page=${page}${perPage}${key}` )
        .then( ( resp ) => {
            const data = resp.data.hits;
            const mark = data.reduce( ( acc, el ) => acc + `<li class="image-card">${template( el )}</li>`, `` );
            ul.insertAdjacentHTML( `beforeend`, mark );
        } );
}

ul.addEventListener( `click`, event => {
    if( event.target.className === `gallery__image` ) {
        modalDiv.setAttribute( `class`, `lightbox__overlay` );
        modalDivButton.setAttribute( `class`, `lightbox__button` );
        modalImg.setAttribute( `src`, `${event.target.src}` );
    }
} )

modalDivButton.addEventListener( `click`, closeModalWindow );
document.addEventListener( `keyup`, event => {
    if( event.key === `Escape` ) {
        closeModalWindow();
    }
} );

modalDiv.addEventListener( `click`, ( event ) => {
    if( event.target != modalImg ) {
        closeModalWindow();
    }
} );

function closeModalWindow () {
    modalDiv.setAttribute( `class`, `` );
    modalDivButton.setAttribute( `class`, `invisible` );
    modalImg.setAttribute( `src`, `` );
};