"use client"

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the PersonalInfo schema with Zod
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters" }).optional(),
  location: z.string().optional(),
  educationLevel: z.string().optional(),
  birthMonth: z.string(),
  birthYear: z.string(),
  ageGroup: z.string(),
  profileImage: z.any().optional(),
});

// Create a type from the schema
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Age group type definition - matches database enum with snake_case
export type AgeGroup = "early_childhood" | "elementary" | "middle_school" | "high_school" | "young_adult";

interface PersonalInfoStepProps {
  initialData: PersonalInfo;
  onComplete: (data: PersonalInfo) => void;
  onNext?: () => void;
}

// Helper function to get display name for age group
const getAgeGroupDisplayName = (ageGroup: AgeGroup): string => {
  const displayNames = {
    'early_childhood': 'Early Childhood (0-4 years)',
    'elementary': 'Elementary (5-10 years)', 
    'middle_school': 'Middle School (11-12 years)',
    'high_school': 'High School (13-17 years)',
    'young_adult': 'Young Adult (18+ years)'
  }
  return displayNames[ageGroup] || 'Not specified'
}

// Function to calculate age group based on birth month and year
const calculateAgeGroup = (birthMonth: string, birthYear: string): string => {
  if (!birthMonth || !birthYear) return "young_adult";

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Convert to 1-based month

  const birthYearNum = parseInt(birthYear);
  const birthMonthNum = parseInt(birthMonth);

  // Calculate age in years
  let ageInYears = currentYear - birthYearNum;
  if (currentMonth < birthMonthNum) {
    ageInYears--; // Haven't had birthday this year yet
  }

  // Determine age group based on age in years
  if (ageInYears < 5) {
    return "early_childhood";
  } else if (ageInYears < 11) { // 5-10 years
    return "elementary";
  } else if (ageInYears < 13) { // 11-12 years
    return "middle_school";
  } else if (ageInYears < 18) { // 13-17 years
    return "high_school";
  } else { // 18+ years
    return "young_adult";
  }
};

export default function PersonalInfoStep({ initialData, onComplete, onNext }: PersonalInfoStepProps) {
  // Ensure initialData has default values for all fields
  const defaultData: PersonalInfo = {
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    educationLevel: "",
    birthMonth: "",
    birthYear: "",
    ageGroup: "",
    profileImage: null,
  }

  // Merge initial data with form data, ensuring we properly handle undefined values
  const initialFormData = {
    ...defaultData,
    ...Object.fromEntries(
      Object.entries(initialData).filter(([_, v]) => v !== undefined && v !== null)
    )
  }

  // Setup react-hook-form
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialFormData
  });

  // Dirty bit state
  const [isDirty, setIsDirty] = useState(false)
  const [originalData, setOriginalData] = useState<PersonalInfo>(initialFormData)

  // Apply initial data when it changes (useful for async data loading)
  useEffect(() => {
    console.log("🔄 PersonalInfoStep useEffect triggered");
    console.log("📊 Initial data received:", initialData);

    if (initialData) {
      // Calculate age group immediately if birth data is available
      let calculatedAgeGroup = initialData.ageGroup || "";
      if (initialData.birthMonth && initialData.birthYear && !calculatedAgeGroup) {
        calculatedAgeGroup = calculateAgeGroup(initialData.birthMonth, initialData.birthYear);
        console.log("🧮 Calculated age group from birth data:", calculatedAgeGroup);
      }

      // Create form data with proper defaults
      const initialFormData = {
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        bio: initialData.bio || "",
        location: initialData.location || "",
        educationLevel: initialData.educationLevel || "",
        birthMonth: initialData.birthMonth || "",
        birthYear: initialData.birthYear || "",
        ageGroup: calculatedAgeGroup,
        profileImage: initialData.profileImage || null
      };

      // Console log the field values fetched from db with clear markers
      console.log("🎯 =================================");
      console.log("🎯 PERSONAL INFO - FIELD VALUES FROM DB:");
      console.log("🎯 =================================");
      console.log("🎯 First Name:", initialData.firstName);
      console.log("🎯 Last Name:", initialData.lastName);
      console.log("🎯 Bio:", initialData.bio);
      console.log("🎯 Location:", initialData.location);
      console.log("🎯 Education Level:", initialData.educationLevel);
      console.log("🎯 Birth Month:", initialData.birthMonth);
      console.log("🎯 Birth Year:", initialData.birthYear);
      console.log("🎯 Age Group (original):", initialData.ageGroup);
      console.log("🎯 Age Group (calculated):", calculatedAgeGroup);
      console.log("🎯 Profile Image:", initialData.profileImage);
      console.log("🎯 =================================");

      // Also log the form data being set
      console.log("📝 Form data being set:", initialFormData);

      // Reset the form with the initial data and update original data
      form.reset(initialFormData);
      setOriginalData(initialFormData);
      setIsDirty(false);
      console.log("✅ Form reset completed");

      // Log what value the age group field actually has after reset
      setTimeout(() => {
        console.log("🔍 Age Group field value after reset:", form.getValues("ageGroup"));
      }, 100);
    } else {
      console.log("❌ No initial data provided to PersonalInfoStep");
    }
  }, [initialData, form]);

  // Watch for form changes to set dirty bit
  const watchedValues = form.watch();
  useEffect(() => {
    const currentData = form.getValues();
    const hasChanges = Object.keys(currentData).some(key => {
      const currentValue = currentData[key as keyof PersonalInfo];
      const originalValue = originalData[key as keyof PersonalInfo];
      return currentValue !== originalValue;
    });

    setIsDirty(hasChanges);
  }, [watchedValues, originalData, form]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Watch for changes in birth month and year to auto-calculate age group
  const watchedBirthMonth = form.watch("birthMonth");
  const watchedBirthYear = form.watch("birthYear");

  useEffect(() => {
    if (watchedBirthMonth && watchedBirthYear) {
      const calculatedAgeGroup = calculateAgeGroup(watchedBirthMonth, watchedBirthYear);
      form.setValue("ageGroup", calculatedAgeGroup);
    }
  }, [watchedBirthMonth, watchedBirthYear, form]);

  // Handle form submission
  const onSubmit = async (data: PersonalInfo) => {
    console.log("Form submitted with data:", data);
    console.log("🔍 Personal Info dirty bit:", isDirty);

    if (isDirty) {
      console.log("💾 Personal info has changes, saving to database...");
      // Save to database
      onComplete(data);
      setIsDirty(false);
      setOriginalData(data);
    } else {
      console.log("✅ Personal info unchanged, skipping database save");
      // Still call onComplete to ensure parent component gets the data
      onComplete(data);
    }
    // Navigation will be handled by the parent component after successful submission
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-2">
          This information helps others get to know you better
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little about yourself"
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share your interests, goals, or anything else you'd like others to know.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="birthMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Month</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200 cursor-not-allowed">
                          <SelectValue placeholder="Month from registration">
                            {field.value && field.value !== "" ? 
                              ["", "January", "February", "March", "April", "May", "June", 
                               "July", "August", "September", "October", "November", "December"][parseInt(field.value)] || "Month from registration"
                              : "Month from registration"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Year from registration"
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled
                      className="bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group</FormLabel>
                  <FormControl>
                    <Input 
                      value={field.value ? 
                        getAgeGroupDisplayName(field.value as AgeGroup) : 
                        (watchedBirthMonth && watchedBirthYear ? 
                          getAgeGroupDisplayName(calculateAgeGroup(watchedBirthMonth, watchedBirthYear) as AgeGroup) : 
                          "Not calculated yet")
                      }
                      disabled
                      className="bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormDescription>
                    Age group is automatically calculated from your birth date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                          <SelectValue placeholder="Choose your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="pre_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Pre-School
                          </SelectItem>
                          <SelectItem value="school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            School
                          </SelectItem>
                          <SelectItem value="high_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            High School
                          </SelectItem>
                          <SelectItem value="undergraduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Undergraduate
                          </SelectItem>
                          <SelectItem value="graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Graduate
                          </SelectItem>
                          <SelectItem value="post_graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Post Graduate
                          </SelectItem>
                          <SelectItem value="phd" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            PhD
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}