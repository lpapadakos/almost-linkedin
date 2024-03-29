import { Component, OnInit } from '@angular/core';
import {
  FormGroupDirective,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { Article } from '../../models/article.model';
import { Entry, User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { ArticleService } from '../../services/article.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User = this.userService.user;

  viewedUser: User;
  articles: Array<Article>;

  form: {
    experience?: UntypedFormGroup;
    education?: UntypedFormGroup;
    skills?: UntypedFormGroup;
  };

  entryTypes = [
    {
      name: 'experience',
      label: 'Επαγγελματική εμπειρία',
      form: 'Εισαγωγή επαγγελματικής εμπειρίας',
      form_what: 'Τίτλος Θέσης',
      form_where: 'Επωνυμία Εταιρίας/Οργανισμού',
    },
    {
      name: 'education',
      label: 'Εκπαίδευση',
      form: 'Εισαγωγή εκπαίδευσης',
      form_where: 'Όνομα ιδρύματος/σχολής',
    },
    {
      name: 'skills',
      label: 'Δεξιότητες',
      form: 'Εισαγωγή δεξιότητας',
      form_what: 'Δεξιότητα',
    },
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userService: UserService,
    private articleService: ArticleService
  ) {
    this.titleService.setTitle('Προφίλ - AlmostLinkedIn');
  }

  // Custom validator: Compare From and To Fields for correct time interval
  private intervalValidator(fromControlName: string, toControlName: string) {
    return (formGroup: UntypedFormGroup) => {
      const fromControl = formGroup.controls[fromControlName];
      const toControl = formGroup.controls[toControlName];

      toControl.setErrors(
        !toControl.value || fromControl.value <= toControl.value
          ? null
          : { mustBeInterval: true }
      );
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      const viewedUserId = paramMap.get('userId') || this.user._id;

      this.userService.getById(viewedUserId).subscribe({
        next: (user) => {
          this.viewedUser = user;
          this.titleService.setTitle(user.name + ' - AlmostLinkedIn');

          this.articleService.getFromUser(this.viewedUser._id).subscribe({
            next: (articles) => {
              this.articles = articles;
            },
            error: (error) => {
              this.alertService.error(error);
            },
          });
        },
        error: (error) => {
          this.router.navigate(['/404'], { skipLocationChange: true });
        },
      });
    });

    this.form.experience = this.formBuilder.group(
      {
        what: ['', Validators.required],
        where: ['', Validators.required],
        fromYear: ['', Validators.required],
        toYear: [''],
      },
      {
        validator: this.intervalValidator('fromYear', 'toYear'),
      }
    );

    this.form.education = this.formBuilder.group(
      {
        where: ['', Validators.required],
        fromYear: ['', Validators.required],
        toYear: [''],
      },
      {
        validator: this.intervalValidator('fromYear', 'toYear'),
      }
    );

    this.form.skills = this.formBuilder.group({
      what: ['', Validators.required],
    });
  }

  onSubmit(formDirective: FormGroupDirective, entryType: string) {
    const form = this.form[entryType];
    const array: Array<Entry> = this.viewedUser[entryType].entries;

    if (form.invalid) return;

    this.userService.addEntry(entryType, form.value).subscribe({
      next: (entry: Entry) => {
        array.push(entry);

        // Sort results by fromYear descending
        if (entryType !== 'skills') {
          array.sort((a, b) => b.fromYear - a.fromYear);
        }

        formDirective.resetForm();
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  onStatusChange(entryType: string, isPublic: boolean) {
    this.userService.changeEntryStatus(entryType, isPublic).subscribe({
      next: (res: { message: string }) => {
        this.alertService.success(res.message);
      },
      error: (error) => {
        // revert check on error
        this.viewedUser[entryType].public = !isPublic;
        this.alertService.error(error);
      },
    });
  }

  deleteEntry(entryType: string, entry: Entry) {
    const array = this.viewedUser[entryType].entries;

    this.userService.deleteEntry(entryType, entry._id).subscribe({
      next: () => {
        const index = array.findIndex((e) => e._id === entry._id);
        if (index > -1) array.splice(index, 1);
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }
}
