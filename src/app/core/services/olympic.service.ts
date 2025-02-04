import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<any>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next(null);
        return caught;
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }

  getFormattedOlympics() {
    return this.loadInitialData().pipe(
      map(data => this.transformToChartData(data))
    );
  }

  private transformToChartData(data: any[]): any[] {
    return data.map(country => ({
      name: country.country,
      value: country.participations.reduce((sum: number, p: { medalsCount: number }) => sum + p.medalsCount, 0),
      participations: country.participations, 
    }));
  }

  getCountrySeriesData() {
    return this.loadInitialData().pipe(
      map(data => this.transformToCountrySeries(data))
    );
  }

  private transformToCountrySeries(data: any[]): any[] {
    return data.map(country => ({
      name: country.country,
      series: country.participations.map((participation: { year: number, medalsCount: number }) => ({
        name: participation.year.toString(),
        value: participation.medalsCount
      }))
    }));
  }
  
}
