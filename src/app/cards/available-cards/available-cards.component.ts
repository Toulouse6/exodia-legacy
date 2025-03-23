import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-available-cards',
    standalone: true,
    templateUrl: './available-cards.component.html',
    styleUrls: ['./available-cards.component.css'],
    imports: [CommonModule],
})
export class AvailableCardsComponent implements OnInit {

    isFetching = signal(false);
    error = signal('');
    availableCardsFetching = signal(false);

    availableCards = this.cardsService.loadedAvailableCards;

    constructor(public cardsService: CardsService) { }

    ngOnInit() {
        this.availableCardsFetching.set(true);

        try {
            this.cardsService.loadAvailableCards();
        } catch (err: any) {
            this.error.set(err.message);
        } finally {
            this.availableCardsFetching.set(false);
        }
    }

    onSelectCard(card: Card) {
        try {
            this.cardsService.addCardToUserCards(card);
        } catch (err: any) {
            console.error('Error adding card:', err);
        }
    }


    trackById(index: number, card: Card): string {
        return card.id;
    }

}
