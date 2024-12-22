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


    checkCardOrder(): boolean {

        const currentOrder = this.userCards().map((card) => card.title);


        // If we don't have all cards yet, return true (order is still possible)
        if (currentOrder.length !== this.targetOrder.length) {
            return true;
        }

        // Create an array with all the expected card indices for animations
        const userCardElements = Array.from(document.querySelectorAll('.user-card-image'));

        // Check if the order matches the target order
        const isCorrectOrder = currentOrder.every(
            (title, index) => title === this.targetOrder[index]
        );

        if (isCorrectOrder) {
            // Success case
            this.triggerExodiaAnimation();
            this.applyCardEffects();
            console.log('Exodia Summoned!');
            this.exodiaSummoned.set(true);

            // Add success animation class to all cards
            for (let i = 0; i < this.targetOrder.length; i++) {
                const card = userCardElements[i];
                if (card) {
                    card.classList.add('exodia-success');
                } else {
                    console.warn(`Card element missing for index ${i}`);
                }
            }

            const summonSound = new Audio('assets/audio/monster-howl.mp3');
            summonSound.play();
            this.exodiaSummoned.set(false);

            setTimeout(() => {
                // Remove success animation class
                for (let i = 0; i < this.targetOrder.length; i++) {
                    const card = userCardElements[i];
                    if (card) {
                        card.classList.remove('exodia-success');
                    }
                }
                this.resetCards();
            }, 7000);

            return true;
        }

        // Failure case
        const failSound = new Audio('assets/audio/diabolic-laugh.mp3');
        failSound.play();
        this.showFailureMessage();

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

                this.resetCards();
            }, 3500); // Stop animation
        }, 0); // Ensure DOM updates


        return false;
    }



    private updateFallbackText(newText: string, duration: number): void {
        const fallbackTextElement = document.querySelector('.fallback-text');
        if (fallbackTextElement) {
            const originalText = fallbackTextElement.textContent;
            fallbackTextElement.textContent = newText;
            fallbackTextElement.classList.add('error-text');

            setTimeout(() => {
                fallbackTextElement.textContent = originalText;
                fallbackTextElement.classList.remove('error-text');
            }, duration);
        }
    }

    showFailureMessage() {
        this.updateFallbackText('Exodia refuses this order! Try again...', 3000);
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
            setTimeout(() => exodiaHeaderImg.classList.remove('exodia-header-effect'), 6000);
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