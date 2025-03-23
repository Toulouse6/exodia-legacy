import { Component, OnInit, signal, computed } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-user-cards',
    standalone: true,
    templateUrl: './user-cards.component.html',
    styleUrls: ['./user-cards.component.css'],
    imports: [CommonModule],
})
export class UserCardsComponent implements OnInit {
  
    isFetching = signal(false);
    availableCardsFetching = signal(false);
    error = signal('');
    userCards = this.cardsService.loadedUserCards;


    constructor(public cardsService: CardsService) { }

    ngOnInit() {
        this.isFetching.set(true);
        try {
            this.cardsService.loadUserCards();
        } catch (err: any) {
            this.error.set(err.message || 'Failed to load user cards.');
            console.error('Error loading user cards:', err);
        } finally {
            this.isFetching.set(false);
        }
    }

       // Compute fallback message
       fallbackMessage = computed(() => {
        if (this.isFetching() || this.availableCardsFetching()) {
            return 'Loading the Forbidden Pieces...';
        }
    
        const hasCards = this.userCards().length > 0;
        const exodiaWasSummoned = this.cardsService.exodiaSummoned();
    
        if (hasCards && exodiaWasSummoned) {
            return ''; // Success
        }
    
        if (hasCards && !exodiaWasSummoned) {
            return 'Complete the Forbidden Assembly';
        }
    
        return '';
    });
    

    onRemoveCard(card: Card) {
        try {
            this.cardsService.removeUserCard(card);
        } catch (err: any) {
            console.error('Error removing card:', err);
            this.error.set('Failed to remove the card.');
        }
    }

    trackById(index: number, card: Card): string {
        return card.id;
    }
}