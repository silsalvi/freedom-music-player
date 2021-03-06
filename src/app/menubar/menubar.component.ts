import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { BraniService } from '../services/brani.service';
import { RicercaBrani, TipiRicerca } from '../models/brano.model';
import { AdvancedSearch } from '../models/advanced-search.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { loadingProps } from '../config/loading-congif';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css'],
})
export class MenubarComponent implements OnInit, AfterViewInit {
  //valore della ricerca
  ricerca: string = '';
  private timeout: number = 0;
  showDialog: boolean = false;
  isValid: boolean = true;
  advancedSearch: AdvancedSearch = {
    album: null,
    artist: null,
    playlist: null,
    song: null,
    video: null,
  };
  form: FormGroup;
  enabledField: string = TipiRicerca.BRANO;
  @Output() searchEvent = new EventEmitter();
  constructor(
    private braniService: BraniService,
    private formBuilder: FormBuilder,
    private ngxSpinner: NgxSpinnerService
  ) {}
  ngAfterViewInit(): void {
    fromEvent(document, 'keyup').subscribe((event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.showDialog) {
        this.onAdvancedSearch();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      album: [null],
      video: [null],
      brano: [null],
      playlist: [null],
      artista: [null],
    });

    this.onChangeRicerca();
  }

  /**
   * Listener per la ricerca di un brano.
   * Alla digitazione dei caratteri effettua una ricerca per like (similarità)
   */
  onSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.ricerca.length > 0) {
        const request: RicercaBrani = { name: this.ricerca };
        this.braniService.getRisultatiRicerca(request).subscribe((brani) => {
          this.braniService.risultatiRicerca = brani;
          this.braniService.listaBrani = [...brani];
          this.searchEvent.emit('searched');
        });
      }
    }, 500);
  }

  /**
   * Listener per la ricerca avanzata.
   * Chiama il backend per ottenere dei risultati in base ad una ricerca avanzata
   */
  onAdvancedSearch() {
    this.isValid = Object.values(this.form.controls).some(
      (control) => control.value
    );
    if (this.isValid) {
      this.advancedSearch.album = this.form.value.album;
      this.advancedSearch.song = this.form.value.brano;
      this.advancedSearch.artist = this.form.value.artista;
      this.advancedSearch.video = this.form.value.video;
      this.advancedSearch.playlist = this.form.value.playlist;
      this.ngxSpinner.show(undefined, loadingProps);
      this.braniService
        .getRicercheAvanzate(this.advancedSearch)
        .subscribe((brani) => {
          this.showDialog = false;
          this.braniService.risultatiRicerca = brani;
          if (this.enabledField === TipiRicerca.BRANO) {
            this.braniService.listaBrani = [...brani];
          }
          this.searchEvent.emit('searched');
          this.braniService.updateEnabledField.next(this.enabledField);
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  /**
   * Apre la modale di ricerca avanzata
   */
  openModal() {
    this.showDialog = true;
    this.isValid = true;
  }

  /**
   * Handler per il cambio di radio button.
   * Abilita il solo campo attualmente selezionato, disabilitando tutti gli altri
   */
  onChangeRicerca() {
    this.form.disable();
    this.form.reset();
    this.form.controls[this.enabledField].enable();
  }
}
