import { Injectable } from '@angular/core';

export interface DirectoryVendor {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  phone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private vendors: DirectoryVendor[] = [
    { id: 101, name: 'Elegance Venues', category: 'Venue', location: 'New York, NY', rating: 4.9, reviews: 152, imageUrl: 'https://picsum.photos/400/300?image=1074', phone: '555-0101', email: 'contact@elegance.com' },
    { id: 102, name: 'Timeless Photography', category: 'Photography', location: 'Los Angeles, CA', rating: 5.0, reviews: 210, imageUrl: 'https://picsum.photos/400/300?image=201', phone: '555-0102', email: 'hello@timeless.photo' },
    { id: 103, name: 'Gourmet Catering Co.', category: 'Catering', location: 'Chicago, IL', rating: 4.8, reviews: 180, imageUrl: 'https://picsum.photos/400/300?image=305', phone: '555-0103', email: 'events@gourmetco.com' },
    { id: 104, name: 'Bloom & Petal Florists', category: 'Florist', location: 'Miami, FL', rating: 4.9, reviews: 130, imageUrl: 'https://picsum.photos/400/300?image=400', phone: '555-0104', email: 'designs@bloompetal.com' },
    { id: 105, name: 'Rhythmic Beats DJ', category: 'Music', location: 'New York, NY', rating: 4.7, reviews: 95, imageUrl: 'https://picsum.photos/400/300?image=550', phone: '555-0105', email: 'bookings@rhythmicbeats.com' },
    { id: 106, name: 'Sweet Creations Bakery', category: 'Bakery', location: 'San Francisco, CA', rating: 5.0, reviews: 198, imageUrl: 'https://picsum.photos/400/300?image=602', phone: '555-0106', email: 'orders@sweetcreations.com' },
    { id: 107, name: 'The Lakeside Manor', category: 'Venue', location: 'Chicago, IL', rating: 4.8, reviews: 112, imageUrl: 'https://picsum.photos/400/300?image=1075', phone: '555-0107', email: 'lakeside@events.com' },
    { id: 108, name: 'Candid Moments Films', category: 'Videography', location: 'Los Angeles, CA', rating: 4.9, reviews: 140, imageUrl: 'https://picsum.photos/400/300?image=701', phone: '555-0108', email: 'candid@films.com' },
    { id: 109, name: 'A-List Planners', category: 'Planner', location: 'Miami, FL', rating: 5.0, reviews: 88, imageUrl: 'https://picsum.photos/400/300?image=802', phone: '555-0109', email: 'plan@alist.com' },
    { id: 110, name: 'Floral Dreams', category: 'Florist', location: 'New York, NY', rating: 4.8, reviews: 99, imageUrl: 'https://picsum.photos/400/300?image=401', phone: '555-0110', email: 'info@floraldreams.com' }
  ];

  getVendors(): DirectoryVendor[] {
    return this.vendors;
  }
}
