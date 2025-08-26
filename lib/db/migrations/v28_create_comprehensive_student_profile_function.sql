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
  institution_following JSONB,
  circles JSONB,
  created_circles JSONB
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
          'category', g.category,
          'timeframe', g.timeframe,
          'completed', g.completed,
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
              'id', ic.id,
              'name', ic.name
            )
          )
        ) ORDER BY seh.start_date DESC
      ) as education
    FROM student_education_history seh
    LEFT JOIN institution_types it ON seh.institution_type_id = it.id
    LEFT JOIN institution_categories ic ON it.category_id = ic.id
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
      ifc.sender_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ifc.id,
          'institutionId', ifc.receiver_id,
          'connectedAt', ifc.connected_at,
          'institutionProfile', jsonb_build_object(
            'id', ip.id,
            'institutionName', ip.institution_name,
            'institutionType', ip.institution_type,
            'institutionTypeId', ip.institution_type_id,
            'website', ip.website,
            'logoUrl', ip.logo_url,
            'coverImageUrl', ip.cover_image_url,
            'overview', ip.overview,
            'mission', ip.mission,
            'verified', ip.verified,
            'location', p.location
          )
        ) ORDER BY ifc.connected_at DESC
      ) as institution_following
    FROM institution_follow_connections ifc
    JOIN profiles p ON ifc.receiver_id = p.id
    LEFT JOIN institution_profiles ip ON p.id = ip.id
    WHERE ifc.sender_id = student_id_param
    GROUP BY ifc.sender_id
  ),
  circles_member_data AS (
    SELECT 
      cm.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', cb.id,
          'name', cb.name,
          'description', cb.description,
          'color', cb.color,
          'icon', cb.icon,
          'isDefault', cb.is_default,
          'isDisabled', cb.is_disabled,
          'isCreatorDisabled', cb.is_creator_disabled,
          'createdAt', cb.created_at,
          'creator', jsonb_build_object(
            'id', cp.id,
            'firstName', cp.first_name,
            'lastName', cp.last_name,
            'profileImageUrl', cp.profile_image_url
          ),
          'membershipStatus', cm.status,
          'joinedAt', cm.joined_at,
          'isDisabledMember', cm.is_disabled_member
        ) ORDER BY cm.joined_at DESC
      ) as member_circles
    FROM circle_memberships cm
    JOIN circle_badges cb ON cm.circle_id = cb.id
    JOIN profiles cp ON cb.creator_id = cp.id
    WHERE cm.user_id = student_id_param 
      AND cm.status = 'active'
      AND COALESCE(cm.is_disabled_member, false) = false
      AND COALESCE(cb.is_disabled, false) = false
    GROUP BY cm.user_id
  ),
  circles_created_data AS (
    SELECT 
      cb.creator_id,
      jsonb_agg(
        jsonb_build_object(
          'id', cb.id,
          'name', cb.name,
          'description', cb.description,
          'color', cb.color,
          'icon', cb.icon,
          'isDefault', cb.is_default,
          'isDisabled', cb.is_disabled,
          'isCreatorDisabled', cb.is_creator_disabled,
          'createdAt', cb.created_at,
          'creator', jsonb_build_object(
            'id', cp.id,
            'firstName', cp.first_name,
            'lastName', cp.last_name,
            'profileImageUrl', cp.profile_image_url
          ),
          'memberCount', COALESCE(member_counts.count, 0)
        ) ORDER BY cb.created_at DESC
      ) as created_circles
    FROM circle_badges cb
    JOIN profiles cp ON cb.creator_id = cp.id
    LEFT JOIN (
      SELECT 
        circle_id, 
        COUNT(*) as count
      FROM circle_memberships 
      WHERE status = 'active' 
        AND COALESCE(is_disabled_member, false) = false
      GROUP BY circle_id
    ) member_counts ON cb.id = member_counts.circle_id
    WHERE cb.creator_id = student_id_param
      AND COALESCE(cb.is_disabled, false) = false
      AND COALESCE(cb.is_creator_disabled, false) = false
    GROUP BY cb.creator_id
  )
  SELECT 
    sd.id,
    sd.first_name,
    sd.last_name,
    sd.bio,
    sd.location,
    sd.profile_image_url,
    sd.cover_image_url,
    sd.verification_status,
    sd.tagline,
    sd.age_group,
    sd.education_level,
    sd.birth_month,
    sd.birth_year,
    sd.personality_type,
    sd.learning_style,
    sd.favorite_quote,
    COALESCE(ui.interests, '[]'::jsonb) as user_interests,
    COALESCE(us.skills, '[]'::jsonb) as user_skills,
    COALESCE(a.achievements, '[]'::jsonb) as achievements,
    COALESCE(g.goals, '[]'::jsonb) as goals,
    COALESCE(uc.collections, '[]'::jsonb) as user_collections,
    COALESCE(eh.education, '[]'::jsonb) as education_history,
    COALESCE(sl.social_links, '[]'::jsonb) as social_links,
    COALESCE(sc.sent_connections, '[]'::jsonb) as sent_connections,
    COALESCE(rc.received_connections, '[]'::jsonb) as received_connections,
    COALESCE(if_data.institution_following, '[]'::jsonb) as institution_following,
    COALESCE(cmd.member_circles, '[]'::jsonb) as circles,
    COALESCE(ccd.created_circles, '[]'::jsonb) as created_circles
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
  LEFT JOIN institution_following_data if_data ON sd.id = if_data.sender_id
  LEFT JOIN circles_member_data cmd ON sd.id = cmd.user_id
  LEFT JOIN circles_created_data ccd ON sd.id = ccd.creator_id;
END;
$$ LANGUAGE plpgsql;