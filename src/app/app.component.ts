import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { RicercaBraniResponse } from './models/brano.model';
import { BraniService } from './services/brani.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  constructor(
    private primeNgConfig: PrimeNGConfig,
    private braniService: BraniService
  ) {}
  get mostraPlayer() {
    return this.braniService.mostraPlayer;
  }
  ngOnInit() {
    this.primeNgConfig.ripple = true;
    const videoId = localStorage.getItem('idVideoBrano');
    const risultati: RicercaBraniResponse[] =
      JSON.parse(localStorage.getItem('risultati')) || [];

    const brano = risultati.find((song) => song.id === videoId);

    if (risultati.length > 0) {
      this.braniService.risultatiRicerca = risultati;
      this.braniService.listaBrani = [...risultati];
    }
    if (brano) {
      this.braniService.riproduci(brano, false);
    }
  }
}
