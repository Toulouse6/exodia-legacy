import { Component, inject, OnInit } from '@angular/core';
import { AvailableCardsComponent } from './cards/available-cards/available-cards.component';
import { UserCardsComponent } from './cards/user-cards/user-cards.component';
import { CardsService } from './services/cards.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [AvailableCardsComponent, UserCardsComponent],
})
export class AppComponent implements OnInit {

    private cardsService = inject(CardsService);
    private backgroundMusic = new Audio();
    private exodiaSummonSound = new Audio();

    ngOnInit() {

        this.playBackgroundMusic();
        this.checkAndResetIfNeeded();

        // Reset cards if no state
        const savedUserCards = localStorage.getItem('userCardsData');
        const savedAvailableCards = localStorage.getItem('availableCardsData');

        if (!savedUserCards || !savedAvailableCards) {
            this.cardsService.resetCards();
        }
    }

    private checkAndResetIfNeeded() {
        const resetRequired = localStorage.getItem('appResetRequired');

        if (resetRequired === 'true') {
            console.log('App reset required. Resetting cards...');
            this.cardsService.resetCards();
            localStorage.removeItem('appResetRequired');
        }
    }

    // Play background music
    playBackgroundMusic() {
        this.backgroundMusic.src = 'assets/audio/tribe-drum.mp3';
        this.backgroundMusic.loop = true; // Loop
        this.backgroundMusic.volume = 0.3; // Volume
        this.backgroundMusic.play();
    }

    // Play summon effect
    playExodiaSummonEffect() {
        this.exodiaSummonSound.src = 'assets/audio/bels-melody.mp3';
        this.exodiaSummonSound.volume = 8.0; // Volume
        this.exodiaSummonSound.play();
    }


}
