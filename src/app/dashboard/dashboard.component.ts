import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSliderChange } from '@angular/material/slider';
import * as moment from 'moment';

interface GetPrimaryData {
  field1?: string;
  field2?: string;
  field3?: string;
}

interface FeedsResponseDTO {
  created_at: string;
  entry_id: number;
  field1: string;
  field2: string;
  field3: string;
}

interface GraphResponseDTO {
  channel1: {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    field1: string;
    field2: string;
    field3: string;
    created_at: Date;
    updated_at: Date;
    last_entry_id: number;
  };
  feeds: FeedsResponseDTO[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentData: GetPrimaryData = {};

  // use to add thumbnail to slider
  formatTempLabel(value: number) {
    return value + 'C';
  }

  // for charts
  // set chartData and chartLabels at onInit chartOptions,lineChartLegend keep as it is
  title = 'ng2-charts-demo';

  tempChartData = [
    {
      data: [0],
      label: 'Temperature',
    },
  ];

  tempChartLabels = [''];
  humidityChartData = [
    {
      data: [0],
      label: 'Humidity',
    },
  ];

  humidityChartLabels: string[] = [];
  moistureChartData = [
    {
      data: [0],
      label: 'Soil Moisture',
    },
  ];

  moistureChartLabels: string[] = [];

  chartOptions = {
    responsive: true,
  };
  lineChartLegend = true;

  isConnected = true; // default internet connection false

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCurrentData();
    this.getAllGraphData();

    setInterval(() => {
      this.getCurrentData();
    }, 1000);
  }

  public chartColors: any[] = [
    {
      backgroundColor: ['#2ef5b6'],
    },
  ];

  getCurrentData() {
    const url = 'https://api.thingspeak.com/channels/1864706/feeds/last.json';
    this.http.get(url).subscribe({
      next: (res) => {
        this.currentData = res;
      },
    });
  }

  getAllGraphData() {
    const url = 'https://api.thingspeak.com/channels/1864706/feeds.json';
    this.http.get<GraphResponseDTO>(url).subscribe({
      next: (res) => {
        const initialDataSet = res?.feeds.slice(
          res?.feeds.length - 10,
          res?.feeds.length
        );

        this.tempChartData[0].data.pop();
        this.humidityChartData[0].data.pop();
        this.moistureChartData[0].data.pop();

        initialDataSet?.forEach((feed) => {
          this.tempChartData[0].data.push(Number(feed.field1));
          this.tempChartLabels.push(
            moment(feed.created_at).format('DD/MM/YYYY (hh:mm A)')
          );
          this.humidityChartData[0].data.push(Number(feed.field2));
          this.humidityChartLabels.push(
            moment(feed.created_at).format('DD/MM/YYYY (hh:mm A)')
          );
          this.moistureChartData[0].data.push(Number(feed.field3));
          this.moistureChartLabels.push(
            moment(feed.created_at).format('DD/MM/YYYY (hh:mm A)')
          );
        });
      },
    });
  }

  onTempDataChange(data: MatSliderChange) {
    const url = `https://api.thingspeak.com/update?api_key=YLZVUE5DRLVVA5LU&field1=${data.value}`;
    this.http.get(url).subscribe({
      next: () => {},
    });
  }

  onMoistureDataChange(data: MatSliderChange) {
    const url = `https://api.thingspeak.com/update?api_key=YLZVUE5DRLVVA5LU&field2=${data.value}`;
    this.http.get(url).subscribe({
      next: () => {},
    });
  }
}
