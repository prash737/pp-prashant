
-- Create a function to get comprehensive student profile data
CREATE OR REPLACE FUNCTION get_comprehensive_student_profile(student_id_param UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  location TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  verification_status TEXT,
  tagline TEXT,
  age_group TEXT,
  education_level TEXT,
  birth_month TEXT,
  birth_year TEXT,
  personality_type TEXT,
  learning_style TEXT,
  favorite_quote TEXT,
  user_interests JSONB,
  user_skills JSONB,
  achievements JSONB,
  goals JSONB,
  user_collections JSONB,
  education_history JSONB,
  social_links JSONB,
  sent_connections JSONB,
  received_connections JSONB,
  institution_following JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH student_data AS (
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.bio,
      p.location,
      p.profile_image_url,
      p.cover_image_url,
      p.verification_status,
      p.tagline,
      sp.age_group,
      sp.education_level,
      sp.birth_month,
      sp.birth_year,
      sp.personality_type,
      sp.learning_style,
      sp.favorite_quote
    FROM profiles p
    JOIN student_profiles sp ON p.id = sp.id
    WHERE p.id = student_id_param AND p.role = 'student'
  ),
  user_interests_data AS (
    SELECT 
      ui.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ui.id,
          'proficiencyLevel', ui.proficiency_level,
          'interest', jsonb_build_object(
            'id', i.id,
            'name', i.name,
            'category', jsonb_build_object(
              'id', ic.id,
              'name', ic.name
            )
          )
        ) ORDER BY ui.created_at
      ) as interests
    FROM user_interests ui
    JOIN interests i ON ui.interest_id = i.id
    LEFT JOIN interest_categories ic ON i.category_id = ic.id
    WHERE ui.user_id = student_id_param
    GROUP BY ui.user_id
  ),
  user_skills_data AS (
    SELECT 
      us.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', us.id,
          'proficiencyLevel', us.proficiency_level,
          'skill', jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'categoryId', s.category_id,
            'category', jsonb_build_object(
              'id', sc.id,
              'name', sc.name
            )
          )
        ) ORDER BY us.created_at
      ) as skills
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    LEFT JOIN skill_categories sc ON s.category_id = sc.id
    WHERE us.user_id = student_id_param
    GROUP BY us.user_id
  ),
  achievements_data AS (
    SELECT 
      ua.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ua.id,
          'name', ua.name,
          'description', ua.description,
          'dateOfAchievement', ua.date_of_achievement,
          'createdAt', ua.created_at,
          'achievementImageIcon', ua.achievement_image_icon,
          'achievementTypeId', ua.achievement_type_id,
          'achievementType', jsonb_build_object(
            'id', at.id,
            'name', at.name
          )
        ) ORDER BY ua.date_of_achievement DESC
      ) as achievements
    FROM user_achievements ua
    LEFT JOIN achievement_types at ON ua.achievement_type_id = at.id
    WHERE ua.user_id = student_id_param
    GROUP BY ua.user_id
  ),
  goals_data AS (
    SELECT 
      g.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'title', g.title,
          'description', g.description,
          'targetDate', g.target_date,
          'status', g.status,
          'createdAt', g.created_at
        ) ORDER BY g.created_at DESC
      ) as goals
    FROM goals g
    WHERE g.user_id = student_id_param
    GROUP BY g.user_id
  ),
  user_collections_data AS (
    SELECT 
      uc.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', uc.id,
          'name', uc.name,
          'description', uc.description,
          'isPrivate', uc.is_private,
          'createdAt', uc.created_at
        ) ORDER BY uc.created_at DESC
      ) as collections
    FROM user_collections uc
    WHERE uc.user_id = student_id_param
    GROUP BY uc.user_id
  ),
  education_history_data AS (
    SELECT 
      seh.student_id,
      jsonb_agg(
        jsonb_build_object(
          'id', seh.id,
          'institutionName', seh.institution_name,
          'institutionTypeId', seh.institution_type_id,
          'degreeProgram', seh.degree_program,
          'fieldOfStudy', seh.field_of_study,
          'subjects', seh.subjects,
          'startDate', seh.start_date,
          'endDate', seh.end_date,
          'isCurrent', seh.is_current,
          'gradeLevel', seh.grade_level,
          'gpa', seh.gpa,
          'achievements', seh.achievements,
          'description', seh.description,
          'institutionVerified', seh.institution_verified,
          'institutionType', jsonb_build_object(
            'id', it.id,
            'name', it.name,
            'category', jsonb_build_object(
              'id', itc.id,
              'name', itc.name
            )
          )
        ) ORDER BY seh.start_date DESC
      ) as education
    FROM student_education_history seh
    LEFT JOIN institution_types it ON seh.institution_type_id = it.id
    LEFT JOIN institution_type_categories itc ON it.category_id = itc.id
    WHERE seh.student_id = student_id_param
    GROUP BY seh.student_id
  ),
  social_links_data AS (
    SELECT 
      sl.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', sl.id,
          'platform', sl.platform,
          'url', sl.url
        )
      ) as social_links
    FROM social_links sl
    WHERE sl.user_id = student_id_param
    GROUP BY sl.user_id
  ),
  sent_connections_data AS (
    SELECT 
      cr.sender_id as user_id,
      jsonb_agg(
        jsonb_build_object(
          'receiver', jsonb_build_object(
            'id', p.id,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'profileImageUrl', p.profile_image_url,
            'role', p.role
          )
        )
      ) as sent_connections
    FROM connection_requests cr
    JOIN profiles p ON cr.receiver_id = p.id
    WHERE cr.sender_id = student_id_param AND cr.status = 'accepted'
    GROUP BY cr.sender_id
  ),
  received_connections_data AS (
    SELECT 
      cr.receiver_id as user_id,
      jsonb_agg(
        jsonb_build_object(
          'sender', jsonb_build_object(
            'id', p.id,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'profileImageUrl', p.profile_image_url,
            'role', p.role
          )
        )
      ) as received_connections
    FROM connection_requests cr
    JOIN profiles p ON cr.sender_id = p.id
    WHERE cr.receiver_id = student_id_param AND cr.status = 'accepted'
    GROUP BY cr.receiver_id
  ),
  institution_following_data AS (
    SELECT 
      ifc.sender_id as user_id,
      jsonb_agg(
        jsonb_build_object(
          'receiver', jsonb_build_object(
            'id', p.id,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'profileImageUrl', p.profile_image_url,
            'verificationStatus', p.verification_status,
            'institution', jsonb_build_object(
              'institutionName', ip.institution_name,
              'institutionType', ip.institution_type,
              'institutionTypeId', ip.institution_type_id,
              'website', ip.website,
              'logoUrl', ip.logo_url,
              'verified', ip.verified,
              'institutionTypeRef', jsonb_build_object(
                'name', it.name,
                'category', jsonb_build_object(
                  'name', itc.name
                )
              )
            )
          )
        )
      ) as following_institutions
    FROM institution_follow_connections ifc
    JOIN profiles p ON ifc.receiver_id = p.id
    LEFT JOIN institution_profiles ip ON p.id = ip.user_id
    LEFT JOIN institution_types it ON ip.institution_type_id = it.id
    LEFT JOIN institution_type_categories itc ON it.category_id = itc.id
    WHERE ifc.sender_id = student_id_param
    GROUP BY ifc.sender_id
  )
  SELECT 
    sd.*,
    COALESCE(ui.interests, '[]'::jsonb) as user_interests,
    COALESCE(us.skills, '[]'::jsonb) as user_skills,
    COALESCE(a.achievements, '[]'::jsonb) as achievements,
    COALESCE(g.goals, '[]'::jsonb) as goals,
    COALESCE(uc.collections, '[]'::jsonb) as user_collections,
    COALESCE(eh.education, '[]'::jsonb) as education_history,
    COALESCE(sl.social_links, '[]'::jsonb) as social_links,
    COALESCE(sc.sent_connections, '[]'::jsonb) as sent_connections,
    COALESCE(rc.received_connections, '[]'::jsonb) as received_connections,
    COALESCE(if_data.following_institutions, '[]'::jsonb) as institution_following
  FROM student_data sd
  LEFT JOIN user_interests_data ui ON sd.id = ui.user_id
  LEFT JOIN user_skills_data us ON sd.id = us.user_id
  LEFT JOIN achievements_data a ON sd.id = a.user_id
  LEFT JOIN goals_data g ON sd.id = g.user_id
  LEFT JOIN user_collections_data uc ON sd.id = uc.user_id
  LEFT JOIN education_history_data eh ON sd.id = eh.student_id
  LEFT JOIN social_links_data sl ON sd.id = sl.user_id
  LEFT JOIN sent_connections_data sc ON sd.id = sc.user_id
  LEFT JOIN received_connections_data rc ON sd.id = rc.user_id
  LEFT JOIN institution_following_data if_data ON sd.id = if_data.user_id;
END;
$$ LANGUAGE plpgsql;
