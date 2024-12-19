import { inject, Injectable, signal } from '@angular/core';
import { Card } from '../cards/cards.model';
@Injectable({
    providedIn: 'root',
})
export class CardsService {

    exodiaSummoned = signal(false);

    private userCards = signal<Card[]>([]);
    private availableCards = signal<Card[]>([]);

    loadedUserCards = this.userCards.asReadonly();
    loadedAvailableCards = this.availableCards.asReadonly();


    targetOrder: string[] = [
        'EX Legendary 1/5',
        'EX Legendary 2/5',
        'EX Legendary 3/5',
        'EX Legendary 4/5',
        'EX Legendary 5/5',
    ];

    private shuffleArray<T>(array: T[]): T[] {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    }

    private initialCards: Card[] = [
        {
            id: '1',
            title: 'EX Legendary 1/5',
            image: { src: 'exodia1.png', alt: 'Exodia 1/5' },
            lat: 34.9949,
            lon: 135.785,
        },
        {
            id: '2',
            title: 'EX Legendary 2/5',
            image: { src: 'exodia2.png', alt: 'Exodia 2/5' },
            lat: -18.2871,
            lon: 147.6992,
        },
        {
            id: '3',
            title: 'EX Legendary 3/5',
            image: { src: 'exodia3.png', alt: 'Exodia 3/5' },
            lat: 48.8566,
            lon: 2.3522,
        },
        {
            id: '4',
            title: 'EX Legendary 4/5',
            image: { src: 'exodia4.png', alt: 'Exodia 4/5' },
            lat: 36.1069,
            lon: -112.1129,
        },
        {
            id: '5',
            title: 'EX Legendary 5/5',
            image: { src: 'exodia5.png', alt: 'Exodia 5/5' },
            lat: 45.4408,
            lon: 12.3155,
        },
    ];


    constructor() {
        this.initializeLocalStorage();
    }

    private initializeLocalStorage() {
        const savedAvailableCards = localStorage.getItem('availableCardsData');
        const savedUserCards = localStorage.getItem('userCardsData');

        if (savedAvailableCards && savedUserCards) {
            this.availableCards.set(JSON.parse(savedAvailableCards));
            this.userCards.set(JSON.parse(savedUserCards));
        } else {
            this.availableCards.set([...this.initialCards]);
            this.userCards.set([]);
            this.updateLocalStorage();
        }
    }

    private updateLocalStorage() {
        localStorage.setItem('userCardsData', JSON.stringify(this.userCards()));
        localStorage.setItem('availableCardsData', JSON.stringify(this.availableCards()));
    }

    loadAvailableCards(): void {
        const userCardIds = new Set(this.userCards().map((card) => card.id));
        const shuffledCards = this.shuffleArray(
            this.initialCards.filter((card) => !userCardIds.has(card.id))
        );
        this.availableCards.set(shuffledCards);
        this.updateLocalStorage();
    }

    // Load User Cards
    loadUserCards(): void {
    }


    // Add Card
    addCardToUserCards(card: Card): void {
        if (this.userCards().some((c) => c.id === card.id)) return;

        const updatedUserCards = [...this.userCards(), card];

        // Play effect
        const clickSound = new Audio('assets/audio/drop.mp3');
        clickSound.play();

        this.userCards.set(updatedUserCards);
        this.availableCards.set(this.availableCards().filter((c) => c.id !== card.id));
        this.updateLocalStorage();

        this.checkCardOrder();
    }


    // Remove Card
    removeUserCard(card: Card): void {
        const updatedUserCards = this.userCards().filter((c) => c.id !== card.id);
        const updatedAvailableCards = [...this.availableCards(), card];

        // Play effect
        const clickSound = new Audio('assets/audio/drop.mp3');
        clickSound.play();

        this.userCards.set(updatedUserCards);
        this.availableCards.set(updatedAvailableCards);
        this.updateLocalStorage();
    }

    checkCardOrder() {
        const currentOrder = this.userCards().map((card) => card.title);

        if (currentOrder.length === this.targetOrder.length) {
            const isCorrectOrder = currentOrder.every((title, index) => title === this.targetOrder[index]);

            if (isCorrectOrder) {
                this.triggerExodiaAnimation();
                this.applyCardEffects();
                console.log('Exodia Summoned!');
                this.exodiaSummoned.set(true);

                // Summon sound
                const summonSound = new Audio('assets/audio/exodia-summon.mp3');
                summonSound.play();

                setTimeout(() => {
                    this.resetCards();
                    this.exodiaSummoned.set(false);
                }, 7500);
            } else {
                // Play fail sound
                const failSound = new Audio('assets/audio/diabolic-laugh.mp3');
                failSound.play();

                // Apply fail effects
                setTimeout(() => {
                    const userCardElements = document.querySelectorAll('.user-card-image');
                    userCardElements.forEach((card) => {
                        card.classList.add('exodia-fail');
                    });

                    // Remove effect
                    setTimeout(() => {
                        userCardElements.forEach((card) => {
                            card.classList.remove('exodia-fail');
                        });

                        // Non-blocking notification
                        this.showFailureMessage();
                        this.resetCards();
                    }, 5000); // Stop animation
                }, 0); // Ensure DOM updates
            }
        }
    }

    showFailureMessage() {
        const messageContainer = document.createElement('div');
        messageContainer.textContent = 'Exodia refuses this order! Try again...';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '3%';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.padding = '10px 20px';
        messageContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        messageContainer.style.color = 'white';
        messageContainer.style.fontSize = '1.2rem';
        messageContainer.style.borderRadius = '15px';
        messageContainer.style.zIndex = '1000';

        document.body.appendChild(messageContainer);

        // Remove message
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 5000);
    }


    private applyCardEffects() {
        setTimeout(() => {
            const userCards = document.querySelectorAll('.user-card-image');
            if (userCards.length === 0) {
                console.warn('No user cards found for animation.');
                return;
            }

            userCards.forEach((card, index) => {
                setTimeout(() => {
                    console.log(`Applying exodia-effect to card ${index}`); // Debug log
                    card.classList.add('exodia-effect');
                }, index * 800); // delay for each card
            });

            // Remove animation timeout
            setTimeout(() => {
                userCards.forEach((card) => {
                    console.log(`Removing exodia-effect from card`); // Debug log
                    card.classList.remove('exodia-effect');
                });
            }, 6000);
        }, 0);
    }

    private triggerExodiaAnimation() {
        const exodiaHeader = document.getElementById('exodia-header');
        const exodiaHeaderImg = document.querySelector('#exodia-header img');

        if (exodiaHeader) {
            console.log('Applying exodia-glow to header');
            exodiaHeader.classList.add('exodia-glow');
            setTimeout(() => exodiaHeader.classList.remove('exodia-glow'), 3000);
        }

        if (exodiaHeaderImg) {
            console.log('Applying exodia-header-effect to image');
            exodiaHeaderImg.classList.add('exodia-header-effect');
            setTimeout(() => exodiaHeaderImg.classList.remove('exodia-header-effect'), 4000);
        }

        this.applyCardEffects();
    }

    resetCards(): void {
        this.userCards.set([]);
        const shuffledCards = this.shuffleArray([...this.initialCards]);
        this.availableCards.set(shuffledCards);
        this.updateLocalStorage();
    }


}